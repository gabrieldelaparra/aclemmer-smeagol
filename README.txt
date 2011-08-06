================================================================================
Introduction
================================================================================
Welcome to Smeagol!

Smeagol is an experimental user interface to the Semantic Web. It combines
navigation and query features so that you can browse through the Linked Data
that a repository has to offer, and then easily create a query "in place,"
right in the context of your browsing.

A "query" can be thought of as a precision search: not "find me some pages I
might find interesting" but "find *all* items that satisfy these *exact*
criteria."

The ability to query is a big part of what gives the Semantic Web its promise
of power. Today, people are used to typing in keywords and having Google dump
thousands of pages on them, which they must manually sift through to find the
information they seek. Tomorrow, interfaces like Smeagol will leverage the
powerful structure of Linked Data to give users the exact answers from *within*
the pages. It's the difference between using Google to generate haystacks for
you to hunt through, versus using Smeagol to provide you directly with your
three or four needles.

You use Smeagol by first finding a starting point in the Semantic Web.  An
ordinary Google-like search box is used for this purpose. Once you've found a
concept that interests you, you can explore it and navigate from concept to
concept. Smeagol helps you visualize the data as you wander through the forest,
building your own trail of interest. Any time you want, you can *generalize*
parts of this trail to discover other things in the Semantic Web that have
similar parts or relationships.

This version of Smeagol is connected to dbPedia, a huge source of Linked Data
on all topics, extracted from Wikipedia. We suggest you give it a try and see
what kinds of interesting information and patterns you can unearth.


================================================================================
Requirements
================================================================================

Smeagol Client will run on most modern web browsers.

Smeagol Server is a Java application, so it should work with a variety of operating systems. It has been verified to work with the following configuration:

* Ubuntu Linux 10.04 LTS
* Java JRE 1.6
* Apache Web Server 2.x
* PHP 5.x
* MySQL 5.x

Additionally, in order to compile Smeagol Server the followed are required:
* Java JDK 1.6 
* Netbeans or Apache Ant.

================================================================================
Installation
================================================================================
* Ensure Mercurial is installed. E.g. for a Debian or Ubuntu server:
> apt-get install mercurial

* From your home directory, check out the project:
> hg clone https://bitbucket.org/aclemmer/smeagol
> cd smeagol

* Verify the configuration options for Smeagol server in:
server/project/src/edu/umw/cs/smeagol/config/smeagol.properties

The configuration should work as-is. 'host' and 'port' determine from where the
server's HTTP interface will be available; changes to these should be mirrored
in client/settings.php. If you wish to experiment with different SPARQL
endpoints, review the sparql_* properties. At present, they are configured to
work with Virtuoso servers. If you prefer a different configuration for the
database, change db_name, db_user, and db_password. 

* Ensure that the database and user specified in smeagol.properties exists in MySQL.
E.g., from a MySQL prompt:
> create database smeagol;
> grant all privileges on smeagol.* to 'smeagol'@'localhost' identified by 'smeagol';
> flush privileges;

* Create the Smeagol database tables:
E.g., from a MySQL prompt:
> use smeagol;
> source schema.sql

* The Smeagol server process is managed by Tanuki Software's Java Service
Wrapper. Minimally, ensure that the path to the java executable is correct.
Search in the following file for wrapper.java.command:
server/deploy/conf/wrapper.conf

* Compile Smeagol server. The Netbeans (and Ant) buildfile is located at:
server/project/build.xml
E.g. (assumes ant-optional is installed):
> cd server/project
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

  - The included Java Service wrapper may not work on all platforms. You can
    either switch to a different one
(http://wrapper.tanukisoftware.com/doc/english/download), or start Smeagol
server without the wrapper:
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
