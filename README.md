# To-Do-List-API
To Do List API for Interview take-home test
______________________________________________________________________________________________________________
Setup Method to run locally through Visual Studio + Docker Desktop (how I did testing during development)
1. Requires Docker Desktop installed
2. Download or clone the repository and press "Start" in Visual Studio targeting the Debug and trust the generated self-signed TLS certificate if a notification of such appears.
3. Visual Studio should create a Docker image + container running the API, alongside the React front end running simultaneously.

Setup Methods to run locally through Command Prompt:
1. Open Command Prompt.
2. Check versions of .NET, Node.js, and npm to make sure they're installed
   ```
   dotnet --version
   node -v
   npm -v
   ```
3. Go to the To-Do-List-API directory using the cd command.
4. ```cd ToDoList.Server\bin\Release\net8.0```
5. ```dotnet run --urls="https://localhost:8081"```
6. Open an second Command Prompt window
7. Go to the To-Do-List-API directory using the cd command.
8. ```cd todolist.client```
9.```set PORT=64163 && npm start```

Additional Notes:
I was originally planning on having the front end and API in separate Docker images to make setup and build simpler, but I have never used Docker with a React app before, so I was having trouble getting them to communicate properly, and ultimately left it out of this submission. If I had more time, that would be what I would have spent it trying to fix.

______________________________________________________________________________________________________________
Assumptions:
1. Basic productivity app primarily for internal use. My assumption is that the task management app makes the most sense either as a personal tool where pretty much only one user is ever interacting with the database or as an internal productivity tool only available to employees within the private network.
   - I made this assumption because to me, this is the use case that seemed to line up best with the requirements given.
2. For this specific implementation, I assumed that the requirements were not asking for a cloud-hosted solution.
   - A cloud-hosted web app would be difficult to secure without knowledge of who needs to be whitelisted and granted access, as my github link for this submission is public and theoretically anyone can take it and run the front end and send requests to the API, allowing a malicious actor to run up the bill on my AWS account.
       - From there, I took into account the additional features that would be required for adequate security measures against this, and figured it was beyond the scope of a short take-home assessment.
Scalability:
- The app will not scale well in it's current form.
  - As a SQLite in-memory database, it is too tightly integrated with the API and cannot easily scale horizonatally.
      - SQLite also only allows for one process to write to a database at a time, greatly hampering the scalability of write-heavy operations.
      - As the app's traffic scales, you want a database that handles concurrency better, is more permanent, and is easier to shard/load balance.
  - In-memory databases lack data permanence, meaning availability and reliability will quickly become issues as the number of users grow.
  - SQLite relies on file-based data locking rather than the transaction-based locking of other RDBMS.
      - Much slower and less precise than transaction or row-based locks, which results in much more errors and significantly reduced performance when many users are trying to write at once.
  - As traffic grows, the web app will need to use caching to perform at reasonable speeds. Caches store frequently-used data in faster hardware/services for improved performance. A common caching product that could be integrated is Redis or a content delivery network like CloudFront

Possible Future Implementations:
1. Cloud Hosting
   - Host API and web app front end on a cloud provider like AWS, Azure, or GCP. For this use case, I would choose to host the API on an EC2 instance and the React app in an S3 bucket delivered through CloudFront.
       - Load Balancer, CDN, RDS, CloudWatch logs, backups & cold storage, key management service for secrets, possibly containerization using Docker, managed through Kubernetes.
2. Authentication
   - If the app is going to be accessible to the public, it needs some form of authentication.
     - One way is via an account/user system where users need to register. This is best if the app expects public use (i.e. selling the app as a product).
     - Another viable option is via a shared secret like an API key or authentication token. This ensures that the server only accepts requests from approved sources without forcing a login procedure.
   - If making an user/account system, I would likely create a separate database for it that the API would also have access to, for both security and scaling reasons.
       - A single account database can service orders of magnitude more users than a single database holding the business data. This is because authentication generally makes up a tiny fraction of traffic.
3. Rate-Limiting
   - Prevent users and malicious attackers from overloading the hosting servers, incurring unnecessary charges.
4. Security
   - Use non-self-signed TLS certificates (https://) to encrypt data in transit
   - Hash and salt any user passwords or secrets stored in databases
   - Set up WAF (firewall) rules in AWS
5. Alerts/Webhook Integrations (not strictly necessary, but would be a good complement to this web app)
