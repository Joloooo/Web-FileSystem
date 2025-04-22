# Web File System – Backend

**Total Time Spent:** 5 hours (30‑minute review, 3.5 hours coding, 1‑hour write‑up).



##  How I Approached the Problem

1. **Breaking down the structure of the app and understanding the architecture**  
   I drew and tried to understand how the project would work.  
   <div align="center">
     <img src="./docs/Diagram.drawio.svg" alt="App Structure" />
   </div>

2. **Understanding the frontend**  
   After understanding the structure of the app and how the frontend worked...

3. **Planning the backend modules**  
   After realizing this structure, I had to create 8 APIs. I decided to create three separate modules for this, since I think it is more scalable to break it down into separate modules. These modules were:

   - **Storage Module:**  
     General module which later could be reused for executing multiple different operations, like setting up service to delete all user files if account is deleted. sharing the files  with documents module

   - **Folders Module:**  
     One that focuses on 4 APIs related to folders.  
     - Handles: creation, updating, deletion, and fetching of folders.  
     - With each new load, upload, or folder change, the entire folder tree is retrieved again so that the frontend can update accordingly.

     
        - `@Post()` → `create(body)`  
          → calls `FoldersService.create()`  
          → verifies parent folder via `folderRepo.findOne()`  
          → creates new folder with `folderRepo.save()`

        - `@Patch(':id')` → `update(id, body)`  
          → calls `FoldersService.updateName()`  
          → updates folder name using `folderRepo.save()`

        - `@Delete(':id')` → `delete(id)`  
          → calls `FoldersService.delete()`  
          → removes folder using `folderRepo.remove()`

        - `@Get()` → `findAll()`  
          → calls `FoldersService.getFolderTree()`  
          → retrieves full tree using recursive queries or joins via `folderRepo.find()` also here takes place the creation of the Root main file so that everything is sent in one object.

   - **Documents Module:**  
      -  Here indivividual storage methods are use and integrated DB and S3. below are each controller flow shown
            - `@Post()` → `upload()`  
              → calls `DocumentsService.upload()`  
              → calls `StorageService.uploadFile()` + saves metadata via `documentRepo.save()`

            - `@Get(':id')` → `download(id)`  
              → calls `DocumentsService.getFileWithStream()`  
              → calls `StorageService.getFileStream()` + fetches metadata via `documentRepo.findOne()`

            - `@Patch(':id')` → `rename(id, body)`  
              → calls `DocumentsService.updateName()`  
              → updates document name via `documentRepo.save()`

            - `@Delete(':id')` → `delete(id)`  
              → calls `DocumentsService.delete()`  
              → calls `StorageService.deleteFile()` + deletes record via `documentRepo.remove()`


    - **Final Implementation steps:**  I created two utils additionally.
      - first one was used for bonus task to setup proxy where all the requests comming in from /api/v1/** would be redirected to legacy backend
      - created custom slug util just in case there is need to modify the slugging system this way by modifying it in util it will be modified in the entire project
      - Added volume for data persistance so that whenever you close the containers so that files would not be deleted.
---

## Most Challenging Part & How I Solved It

### Problem: Designing a Scalable System Architecture  
The hardest part was defining an architecture that would be **scalable**, **easy to modify**, and **easy to understand**. I chose a modular approach and split the backend into three NestJS modules:

1. **Storage Module** – abstracts all interaction with S3.  
2. **Documents Module** – responsible for document uploads and metadata.  
3. **Folders Module** – handles the folder tree (create / rename / delete / list).

Because folders and documents are very related, first I wanted to to merge them into a single module. Instead, I kept them separate and linked them with **NestJS’s circular‑dependency**. This decision keeps the door open for future features—e.g., shared documents, multiple document types, or having the ability to add different bussiness logic for validation or creating system for sharing files between users, while at the same time avoiding having everything crammed in one module.

A second challenge was ensuring that with S3 uploads/download/delete would upldate both postgres database and S3 at the same time. Howeverm that became a lot more clear once I split things into modules:  


### Solution: Modular Design + Transactional Consistency  

- **Clear module boundaries**  
  - *Storage Module* exposes an `uploadFile()` service that later document module calls and nothing communicates with S3 directly.  
  - *Documents* and *Folders* communicate via injected providers, rather than having everything crammed together.

- **Execution steps now**  
  1. Frontend loads Folder tree - `getRootTree()`
  2. User clicks add file & frontend sends `POST /api/v2/documents`
  3. `DocumentsController` uses file interceptor to extract file and calls `DocumentService`
  4. `DocumentService.upload` does two things:
     - A. Calls `StorageService.uploadFile` to store file in S3  
     - B. Creates a new `Document` entity in Postgres


- **Greater structure for scalability**  

---
## What I Would Do Differently for Production

- **Add authentication:**  
  This is obviously done in a real project; otherwise, detecting individual users would not be feasible.

- **Add validation:**  
  - Uploading excessively large files or completely unrelated data: I would implement type and size validation.  
  - Add reCAPTCHA or CAPTCHA or some form of validation before upload or authentication to ensure normal behavior.  
  - Add limits to how many files & folders can be uploaded:
    - Within 5 minutes  
    - In 1 hour (e.g., 500MB limit, with an alarm if it exceeds 50MB)  
    - In 1 day (e.g., limit up to 1GB)

- **Switch to GraphQL:**  
  One of the big advantages of Nest is that it has a GraphQL server built in. Instead of fetching the entire tree, requests would be made for specific data. This is especially useful for the frontend—having GraphQL in the backend simplifies frontend development, as the frontend developer won't need to wait for a new custom endpoint every time.

- **Testing:**  
  I would integrate unit and integration tests for safety.  
    - For uploading files: to measure latency and how fast files are being uploaded.  
    - For folder tree management: to ensure changes made in the application do not break the structure of the tree.

- **UI:**  
  When a file is being uploaded, there should be visible feedback. Currently, I didn’t see any indication, and someone might think it’s not working while the file is still uploading.

