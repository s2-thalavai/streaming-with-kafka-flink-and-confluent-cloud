#   Live Leaderboard Application

This application provides a live view of an F1 racing leaderboard, along with detailed information about a selected driver. It uses a backend (Node.js with Express) to retrieve and process data from Confluent Cloud (Kafka) and a frontend (HTML/JavaScript) to display the information.

![](architecture.gif)

##  Table of Contents

* [Features](#features)
* [Technologies Used](#technologies-used)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Running the Application](#running-the-application)
* [Backend Setup](#backend-setup)
* [Frontend Setup ](#frontend-setup)
* [API Endpoints](#api-endpoints)
* [Confluent Cloud (Kafka) Integration](#confluent-cloud-kafka-integration)
* [Redis Usage](#redis-usage)
* [Graceful Shutdown](#graceful-shutdown)


##  Features

* **Live Leaderboard:** Displays real-time F1 racing standings.
* **Driver Details:** Provides information on individual drivers, position in the lap, and interval.
* **Real-time Updates:** Leaderboard data is updated in real-time via Confluent Cloud (Kafka).
* **Backend API:** Provides a RESTful API for fetching leaderboard data.
* **Redis Caching:** Uses Redis to cache and serve leaderboard data efficiently.
* **User-Friendly Interface:** Clean and intuitive design with F1-themed styling.


##  Technologies Used

* **Backend:**
    * Node.js
    * Python
    * Redis
* **Frontend:**
    * HTML
    * CSS
    * JavaScript
* **Data Streaming:**
    * Confluent Cloud


##  Prerequisites

Before you begin, ensure you have the following installed and accounts set up:

* **Node.js and npm:** [https://nodejs.org/](https://nodejs.org/)
* **Python3**: [https://www.python.org/downloads/](https://www.python.org/downloads/)
* **Pip3 installation**: [https://pip.pypa.io/en/stable/installation/](https://pip.pypa.io/en/stable/installation/)
* **Redis installation**:
   <details>
     <summary>Windows Installation</summary>
   
     1. **Install WSL** using the following link:  
        [Installing WSL on Windows](https://learn.microsoft.com/en-us/windows/wsl/install)  
     2. **For connecting VS Code to WSL**, refer to  
        [Connecting to WSL](https://code.visualstudio.com/docs/remote/wsl-tutorial)
   
     3. **Once WSL is installed**, open your WSL terminal (e.g., Ubuntu) and run the following commands:
   
        ```bash
        sudo apt update
        sudo apt install redis-server
        sudo systemctl enable redis-server.service
        sudo systemctl start redis-server
        ```
   
   </details>
  <details>
    <summary>macOS Installation</summary>
    
    For macOS, run:
    
    ```bash
    brew install redis
    brew services start redis
    brew services info redis
    ```
  </details>

* **Confluent Cloud Account:** You'll need an account on Confluent Cloud with a Kafka cluster set up. [https://www.confluent.io/confluent-cloud/tryfree](https://www.confluent.io/confluent-cloud/tryfree/)

##  Installation

1.  **Clone the repository:**
   Open a code editor such as VS code. Open a terminal and run the following.

    ```bash
    git clone https://github.com/s2-thalavai/streaming-with-kafka-flink-and-confluent-cloud.git
    cd streaming-with-kafka-flink-and-confluent-cloud
    ```

2.  **Install backend dependencies:**

    ```bash
    cd f1_backend
    npm install
    cd ..
    ```

##  Running the Application

1.  **Run the Producer code**
      
    * Sign in to Confluent Cloud- (https://confluent.cloud/auth_callback)
    * Create an Environment and a Basic Cluster
    * Create an API key using service account in Accounts and Access(https://docs.confluent.io/cloud/current/security/authenticate/workload-identities/service-accounts/api-keys/overview.html) section(we will use it to authenticate to Confluent Cloud Cluster)
      1.  Click the hamburger icon on the top right of the Confluent cloud home page > Open Accounts and Access option > Click Service Accounts > +Add service account.
      2.  Give name and description for the service account. Click Next.
      3.  Select the environment you have created the cluster in and select Organization Admin for the role assignment > Click Next.
         ![](org_permission.png)
      5.  Review the settings and create.
      6.  Click the hamburger icon of the home page > Select API keys > Click +Add API Key > Select Service Account > Choose your existing service account you created previously.
         ![](api-1.png)
      8.  Select Kafka Cluster and choose the environment and cluster option and click next
         ![](api-2.png)
      10.  Give name and description. Click Next.
      11.  Download the API Key and Secret and click Complete.
    * Go to the cluster you created before. Go to topics in the left navigation pane, click topics.
    * Click "Create a topic" and name it "**f1.leaderboard.results**". Create with Defaults. Skip the data contracts for now.
    * Open the f1_producer.py file in your code editor and add the Confluent Cloud Kafka bootstrap server URL, API Key, and API Secret in the f1_producer.py file as shown below. You can get the boostrap server URL from the "Cluster Settings" in the Cluster overview and the API key and secret from the downloaded file.

       ```javascript
          conf = {
             'bootstrap.servers': '<YOUR_CONFLUENT_CLOUD_CLUSTER_URL>',  # Replace with your cluster's bootstrap server URL
             'sasl.username': '<YOUR_CONFLUENT_CLOUD_API_KEY>',      # Replace with your API key
             'sasl.password': '<YOUR_CONFLUENT_CLOUD_API_SECRET>'   # Replace with your API secret
          }
       ```

       * Run the following:
        ```bash
           python3 -m venv venv
           source venv/bin/activate
           pip3 install confluent_kafka
           python3 f1_producer.py
        ```
       * **Ensure this terminal window is running continuoulsy. Do not close this window.**

2.  **Start the backend server:**

    * **Open a new terminal window.**

    <details>
      <summary>OpenSSL For Linux/macOS:</summary>
      
      * When you install OpenSSL with Homebrew on macOS, it's often installed in a location like `/usr/local/opt/openssl` (or `/opt/homebrew/opt/openssl@3` on Apple Silicon Macs), which isn't in the default search path for compilers.
      
      * **Find the OpenSSL prefix:**
          ```bash
          brew --prefix openssl
          ```

          This command will output the path, for example, `/usr/local/opt/openssl@1.1` or `/opt/homebrew/opt/openssl@3` (the version might differ). We will copy this path into variable `OPENSSL_PREFIX`. If no path is returned, it means that OpenSSL is not installed. In this case, run the following:

          ```bash
          brew update
          brew install openssl
          brew link --force openssl
          brew --prefix openssl
          ```
          Now you should be able to see the path.
      
      * **Set environment variables:**
          ```bash
          export OPENSSL_PREFIX="</path/of/openssl>" # REPLACE with the actual path from 'brew --prefix openssl'
          export LDFLAGS="-L${OPENSSL_PREFIX}/lib"
          export CPPFLAGS="-I${OPENSSL_PREFIX}/include $CPPFLAGS"
          ```
          This will create environment variables to use the OpenSSL.
      
      * **Reinstall `node-rdkafka`:**
          ```bash
          npm uninstall node-rdkafka # If it was previously installed without SSL support
          npm install node-rdkafka
          ```
          The 'npm install' process for `node-rdkafka` should now pick up these environment variables and use them to find the Homebrew-installed OpenSSL libraries and headers, allowing it to compile with SSL support. Make sure to add the Confluent cloud details are added below in the `server.js`.
    </details>

    <details>
      <summary>OpenSSL For Windows:</summary>
      
      ```bash
      sudo apt update
      sudo apt install libssl-dev -y
      ```
    </details>

    ```bash
    cd f1_backend
    ```
    Open the `server.js` file and edit the following lines as per your credentials.

    ```javascript
    const KAFKA_BROKERS = '<YOUR_CONFLUENT_CLOUD_CLUSTER_URL>'; // e.g., 'pkc-xxxx.region.provider.confluent.cloud:9092'
    const KAFKA_API_KEY = '<YOUR_CONFLUENT_CLOUD_API_KEY>';
    const KAFKA_API_SECRET = '<YOUR_CONFLUENT_CLOUD_API_SECRET>';
    ```
   * Run:
     ```bash
     node server.js
     ```
   * The server will start at `http://localhost:9000/api/leaderboard`.

3.  **Run the frontend:**
    * Open another **new terminal**
    * Navigate to fronend directory,
      ```bash
        cd f1-frontend
      ```
    * Install `http-server` globally using,
      ```bash
        npm install -g http-server
      ```
    * In the same terminal, run
      ```bash
        http-server
      ```
    * This will display under which port the frontend is serving. _Ensure this port is available and not consumed by any other service in your system._
    * Open any browser and type localhost:<port>. This will display the UI of this application.

##  Explanation of Backend Setup (`server.js`)

The backend is built with Node.js and Express. It handles API requests, retrieves data from Redis, and consumes real-time data from Confluent Cloud (Kafka).


###  Key Functionality

* **Confluent Cloud (Kafka) Consumer:**
    * Connects to Confluent Cloud using the provided credentials.
    * Subscribes to the specified Kafka topic.
    * Consumes real-time leaderboard data messages.
    * Parses the JSON messages.
    * Updates the leaderboard data in Redis and to the frontend.
* **Redis Interaction:** Stores and retrieves leaderboard data from Redis. The key `f1_leaderboard_data` is used to store the data as a JSON string.
* **API Endpoint (`/api/leaderboard`):** Provides a GET endpoint to fetch the current leaderboard data from Redis.
* **CORS:** Enables Cross-Origin Resource Sharing to allow requests from the frontend.
* **Graceful Shutdown:** Handles signals to ensure proper disconnection from Confluent Cloud (Kafka) and Redis before exiting.
* **Error Handling:** Includes error logging and handling for Confluent Cloud (Kafka), Redis, and API requests.

##  Explanation for Frontend Setup (`racing_leaderboard.html`)

   * The frontend consists of two pages that displays the live F1 leaderboard and driver information.
   * The index.html is the home page that asks user a question to choose the driver they would like to support.
   * racing_leaderboard.html consist of the code that displays leaderboard updates every few seconds and refreshes every 5 seconds.


###  Dependencies

* Tailwind CSS (CDN)
* Google Fonts (Inter, Orbitron)

###  Key Functionality

* **Data Fetching:** Fetches leaderboard data from the backend API (`/api/leaderboard`).
* **Data Rendering:** Dynamically generates the leaderboard table with the fetched data.
* **Driver Highlighting:** Highlights the selected driver in the table.
* **Clock Display:** Displays a real-time digital clock.
* **Loading Indicator:** Shows a loading spinner while fetching data.
* **Error Message Display:** Displays error messages to the user.
* **Back Button:** Provides a button to navigate back to a previous page.
* **Responsive Design:** Uses Tailwind CSS for a responsive layout.

##  API Endpoints

* `/api/leaderboard` (GET): Returns the current leaderboard data as a JSON array.


## Redis Usage
Redis acts as a high-speed, efficient layer between the backend server and the data source (Confluent Cloud Kafka). It significantly improves the application's performance, reduces the load on Kafka, and enhances the user experience by providing fast access to the leaderboard data.

* **Key:** The leaderboard data is stored under the key `f1_leaderboard_data`.
* **Data Format:** The data is stored as a JSON string.

## Graceful Shutdown
Here are the steps to shutdown the application.

* Stop running the producer.py, server.js and http-server by clicking cmd+c/ctrl-c to stop these programs.
* Go to Confluent Cloud and delete the topic "f1.leaderboard.results" and then delete the cluster and the environment.

## Final result:
![](result.gif)

---

## Kafka Fundamentals

<img width="1603" height="902" alt="image" src="https://github.com/user-attachments/assets/40903957-bbc3-404e-bc84-ae4329731826" />

<img width="947" height="1022" alt="image" src="https://github.com/user-attachments/assets/57ae76c1-8978-4d4f-a579-4063f5c01372" />

<img width="1918" height="1020" alt="image" src="https://github.com/user-attachments/assets/5e437e15-c358-470b-98ad-db93f03128c8" />

<img width="1913" height="872" alt="image" src="https://github.com/user-attachments/assets/b287a180-e903-47bf-9a74-743b2e618f3d" />

<img width="1917" height="876" alt="image" src="https://github.com/user-attachments/assets/6d030ebb-cf67-471c-af1d-3aece7006d79" />

<img width="1918" height="1015" alt="image" src="https://github.com/user-attachments/assets/062bd5a6-31f7-4651-8829-6237cf2f9f54" />

<img width="1918" height="1016" alt="image" src="https://github.com/user-attachments/assets/00b806c8-0ec6-4137-9e12-bd7bceff3d2f" />

<img width="1918" height="992" alt="image" src="https://github.com/user-attachments/assets/9d53e70f-e691-4639-a7e9-d65642ce1aed" />

<img width="1912" height="1018" alt="image" src="https://github.com/user-attachments/assets/a9d1d779-5fed-4dd9-a0cd-b924d4e546d2" />

<img width="1918" height="1017" alt="image" src="https://github.com/user-attachments/assets/e3223c1b-bcbd-4430-91d4-2ed2a6751b8e" />

<img width="1918" height="1016" alt="image" src="https://github.com/user-attachments/assets/7650fd07-e5b3-4bc1-a9a1-b9f30d7989cf" />

<img width="1918" height="1011" alt="image" src="https://github.com/user-attachments/assets/0b6bb98a-a8a0-4003-a7d6-f39d4e2e8475" />

<img width="1918" height="1022" alt="image" src="https://github.com/user-attachments/assets/278017cb-25a2-4592-a522-af2dbb220593" />

<img width="1918" height="1020" alt="image" src="https://github.com/user-attachments/assets/9e843551-d7aa-4dca-be8b-faaea01d1e6e" />

<img width="1918" height="1022" alt="image" src="https://github.com/user-attachments/assets/b938b70a-fe35-49d1-b4d4-41ded653b212" />

<img width="1918" height="1023" alt="image" src="https://github.com/user-attachments/assets/5696bb1d-fe34-46cf-8e50-1717ad40a6ad" />


<img width="1918" height="1018" alt="image" src="https://github.com/user-attachments/assets/e631b47f-1551-474e-a24d-a2db374c0146" />

<img width="1918" height="1022" alt="image" src="https://github.com/user-attachments/assets/8aba5e5a-727f-468d-9588-4368bc970bf0" />

<img width="1918" height="1017" alt="image" src="https://github.com/user-attachments/assets/340486a1-61f0-417c-ad88-93dbab508b20" />


curl 'https://confluent.cloud/api/check_jwt' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -b 'ajs_anonymous_id=368f3086-63cf-4970-95d0-30817dfe98e3; __stripe_mid=075e474e-92cb-4fe1-8ba1-d4c479b0ada8a2360b; ajs_user_id=3301562; ajs_group_id=Organization:d9922364-7769-428e-8089-322eda2f1acf; __stripe_sid=09a3a6f3-6fbd-4d3f-8a02-55768ecd48aab03b44; _legacy_auth0.l2hOp0S0tkSB0TFtvIYfZZ9EaKFvrSc6.is.authenticated=true; auth0.l2hOp0S0tkSB0TFtvIYfZZ9EaKFvrSc6.is.authenticated=true; auth_token=eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYXV0aC1zdGF0aWMuY29uZmx1ZW50LmlvL2p3a3MiLCJraWQiOiJiNzk4YjRkMy05Y2VkLTExZjAtYjU1Zi1hMmM0NmI4ZjU2ZWMiLCJ0eXAiOiJKV1QifQ.eyJvcmdhbml6YXRpb25JZCI6NTU1NjM4LCJvcmdSZXNvdXJjZUlkIjoiZDk5MjIzNjQtNzc2OS00MjhlLTgwODktMzIyZWRhMmYxYWNmIiwidXNlcklkIjozMzAxNTYyLCJ1c2VyUmVzb3VyY2VJZCI6InUteHowMG5rIiwic2NvcGUiOiJodHRwczovL2FwaS5jb25mbHVlbnQuY2xvdWQvIiwiYXVkIjoiQ09OVFJPTF9QTEFORSIsImV4cCI6MTc1OTM3OTk2MywianRpIjoiZTRkMzViNWItYmYxMS00M2VmLWIzNjQtZTRhNTA0NWU4ZTU4IiwiaWF0IjoxNzU5Mzc5NjYzLCJpc3MiOiJDb25mbHVlbnQiLCJzdWIiOiJ1LXh6MDBuayIsIm1heV9hY3QiOnsicHJpbmNpcGFscyI6WyJ1LXh6MDBuayJdfX0.rEypmNhv3V5Ty10nTqF8pWCpJuW3dQRbFVAVWjPp1GXiY4Du65EkwUHxJg0VPzfjX_K5XftSUBJXncWWr6Dm3IVNv60Cl-OwtUHAfPcSR4ZzkfMD1cIs3olOURhZcJT4T1rdHyhX7jFQDpniZ3ORtglaWc_fpbdwKKZWSHOlSIGhecPyw5cxokYzixLZHpYJ184H7Q0sICSZw62iJRxjlrWZbMJ-K0kc2p6M90FWo_05KhjZriDFwKFiDBOqOEbvFNuyHSm0pjKld3v4xAsnCYLM844iDGAd_5_EnvL992Ue8CNrAQwFy2-qPdzBXqb6BFREBKaaKnfiJ_hwup1k4g; _dd_s=rum=2&id=6418547f-2944-42fa-890d-ee6fcf5ec636&created=1759377802192&expire=1759380664219' \
  -H 'priority: u=1, i' \
  -H 'sec-ch-ua: "Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'traceparent: 00-000000000000000012aecc5e3eadae64-429c067f7dcef806-01' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' \
  -H 'x-client-request-id: 83816230-4551-4081-916b-16a4c2741883' \
  -H 'x-datadog-origin: rum' \
  -H 'x-datadog-parent-id: 4799718447511435270' \
  -H 'x-datadog-sampling-priority: 1' \
  -H 'x-datadog-trace-id: 1346238043780918884'

  
