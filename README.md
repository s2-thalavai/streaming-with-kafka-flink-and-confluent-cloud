# streaming-with-kafka-flink-and-confluent-cloud

## Tools:

    Node.js and npm: https://nodejs.org/
    
    Python3: https://www.python.org/downloads/
    
    Pip3 installation: https://pip.pypa.io/en/stable/installation/

### Redis installation:

  ## Windows Installation
  
  Install WSL using the following link:
  Installing WSL on Windows
  
  For connecting VS Code to WSL, refer to
  Connecting to WSL
  
  Once WSL is installed, open your WSL terminal (e.g., Ubuntu) and run the following commands:
  
      sudo apt update
      
      sudo apt install redis-server
      
      sudo systemctl enable redis-server.service
      
      sudo systemctl start redis-server
  
  ### macOS Installation:
  
  For macOS, run:
  
      brew install redis
      
      brew services start redis
      
      brew services info redis
