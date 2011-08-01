* Ensure Mercurial is installed. E.g. for a Debian or Ubuntu server:
> apt-get install mercurial

* From your home directory, check out the project:
> hg clone https://bitbucket.org/aclemmer/smeagol
> cd smeagol

* Set the database properties for Smeagol server in:
server/project/src/edu/umw/cs/smeagol/config/smeagol.properties

* Ensure that the database and user specified in smeagol.properties exists in MySQL.
E.g., from a MySQL prompt:
> create database smeagol;
> grant all privileges on smeagol.* to 'smeagol'@'localhost' identified by 'smeagol';
> flush privileges;

* Create the Smeagol database tables:
E.g., from a MySQL prompt:
> use smeagol;
> source schema.sql

* The Smeagol server process is managed by Tanuki Software's Java Service Wrapper. Minimally, ensure that the path to the java executable is correct. This is set in:
server/deploy/conf/wrapper.conf

* Compile Smeagol server. The Netbeans (and Ant) buildfile is located at:
server/project/build.xml
E.g. (assumes ant-optional is installed):
> cd server/project/build.xml
> ant

* Copy the resulting server.jar file to server/deploy/lib/
> cp dist/server.jar ../deploy/lib

* Copy the dependency jar files to /server/deploy/lib/
> cp dist/lib/*.jar ../deploy/lib

* Check permissions:
> cd ~/smeagol/server/deploy/bin
> chmod 755 *

* Start the Smeagol server process:
> ./smeagol start

  - The include Java Service wrapper may not work on all platforms. You can either switch to a different one (http://wrapper.tanukisoftware.com/doc/english/download), or start Smeagol server with the wrapper:
> cd ../lib
>  java -classpath apache-mime4j-0.6.jar:asm-3.1.jar:commons-codec-1.3.jar:commons-logging-1.1.1.jar:grizzly-servlet-webserver-1.9.18-i.jar:gson-1.4.jar:httpclient-4.0.1.jar:httpcore-4.0.1.jar:httpmime-4.0.1.jar:jersey-client-1.2.jar:jersey-core-1.2.jar:jersey-server-1.2.jar:jsr311-api-1.1.jar:logback-access-0.9.21.jar:logback-classic-0.9.21.jar:logback-core-0.9.21.jar:mysql-connector-java-5.1.13-bin.jar:server.jar:slf4j-api-1.6.0.jar edu.umw.cs.smeagol.SmeagolServer


* Create a softlink from your public_html directory to the Smeagol client:
Varies, e.g.:
> cd ~/public_html
> ln -s ~/smeagol/client/ smeagol

* Verify the Smeagol client settings in:
smeagol/client/settings.php
  - host should be the hostname Smeagol client will be accessed from.
  - baseURL should be the directory Smeagol client is located in under public_html

* Load Smeagol client in your web browser.
