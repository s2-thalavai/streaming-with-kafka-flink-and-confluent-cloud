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

## verify 

<img width="982" height="198" alt="image" src="https://github.com/user-attachments/assets/a568024e-e8d0-49e8-b7f9-9ca84f97a913" />

1. Check Redis Process
2. 
Linux/WSL:

        ps aux | grep redis

Docker:

        docker ps | grep redis
    
Kubernetes:

        kubectl get pods | grep redis
        
2. Verify Port Binding
3. 
Redis typically listens on port 6379. Use:

        netstat -an | grep 6379
        # or
        ss -ltnp | grep 6379

3. Inspect Redis Logs
   
        Default log location: /var/log/redis/redis-server.log
        
        Docker logs: docker logs <container_id>
        
        Kubernetes logs: kubectl logs <pod_name>
        
        Look for:
        
        Ready to accept connections
        
        Server initialized

4. Ping Redis CLI

        redis-cli ping
   
Expected response:

        PONG

5. Check Redis Configuration
   
Ensure redis.conf has:

    bind 127.0.0.1
    port 6379
    daemonize yes

And that it's not blocked by firewall rules:

    sudo ufw allow 6379

6. Monitor with Redis Tools
   
        Use redis-cli info for server stats.
        
        Integrate with Prometheus/Grafana via redis_exporter.
