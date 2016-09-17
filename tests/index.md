# Nightwatch
[Nightwatch introduction](http://nightwatchjs.org/guide#guide)

# Setup nightwatch
```
sudo npm install -g nightwatch
```

# Setup java
You will need to have the Java Development Kit (JDK) installed, minimum required version is 7. 
You can check this by running java -version from the command line.
```
sudo apt-get install openjdk-8-jdk
```

# Launch test
```
cd tests
nightwatch
```

# Lauch with chrome
```
nightwatch -e chrome
```

# Download drivers
[Firefox](https://github.com/mozilla/geckodriver/releases)

[Chrome](http://chromedriver.storage.googleapis.com/index.html)
