# loopback-component-storage-seaweedfs

Loopback Component Storage for SeaweedFS. 

[SeaweedFS](https://github.com/chrislusf/seaweedfs/) is a key-value filesystem that blazingly fast, created by [chrislusf](https://github.com/chrislusf). Based on Facebook Haystack Paper. 

## Installation 
1. Install module via npm
    ```
    npm install https://gitlab.suararadio.com/gendigbadig/loopback-component-storage-seaweedfs.git
    ```
2. Add new datasource namely `seaweedfs` on `server/datasource.json` file
    ```
    {
        ...,
        "seaweedfs": {
            "host": "localhost",
            "port": 9333,
            "name": "seaweedfs",
            "connector": "loopback-component-storage-seaweedfs"
        },
        ...
    }
    ```
3. Create new model that use `seaweedfs` connector via `lb`/`slc` command (depend of your loopback/strongloop-cli version)
    ```
    lb model
    ```
    or 
    ```
    slc loopback:model
    ```
4. Run your app


## TODO
1. API documentation 
2. Unit test
3. ...

##

Copyright 2017 Rahmat Nugraha

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


