Streamus™
=========

A Google Chrome extension which allows users to add YouTube videos to playlists, share playlists and discover new YouTube videos.

Overview
========

Streamus consists of a front-end client and a back-end server.

Client
------
* [jQuery (v2.0.3+)](http://jquery.com/)
* [jQuery UI (v1.10.3+)](http://jqueryui.com/) [AutoComplete and Sortable modules only]
* [BackboneJS (v1.0.0+)](http://backbonejs.org/)
* [RequireJS (v2.1.8+)](http://requirejs.org/)
* [UnderscoreJS (v1.5.1+)](http://underscorejs.org/)
* [Jasmine (v1.5.8+)](http://pivotal.github.io/jasmine/) [Coming soon...]

Server
------

* [C# ASP.NET MVC (v4.0)](http://www.asp.net/mvc/mvc4)
* [NUnit (v2.0+)](http://www.nunit.org/)
* [NHibernate (v3.3.3+)](http://nhforge.org/)
* [AutoFac (v3.1.1+)](https://code.google.com/p/autofac/)
* [AutoMapper](https://github.com/AutoMapper/AutoMapper)
* [log4net](http://logging.apache.org/log4net/)

The server's modules are managed by NuGet Package Manager.

The server is used to record information about a given user's listening experience. All videos, playlist items, playlists and folders are written to the database.
The server is used to enable sharing of playlists between users by copying a playlist row and providing a link to the new row to other users.

The client is able to display and interact with YouTube videos. Videos added to a playlist are stored permanently until deletion. Videos added to the stream are able to be played.
The client is able to allow for discovery of new YouTube videos by suggesting future content based on related videos presently in a stream.

Installation
========

Client
------
1. Navigate to the page: chrome://extensions
2. Mark the checkbox 'Developer mode' as selected.
3. Click the button 'Load unpacked extensions...'
4. Select the Streamus directory title 'Chrome Extension' and click OK.
5. Run the extension.

* NOTE: If you wish to debug the client without a local server instance you will need to set 'localDebug' to false inside 'chrome extension/background/model/settings.js"

Server
------
1. Build 'Streamus Server' in Visual Studio 2012.
2. Build 'Streamus Server Tests' in Visual Studio 2012.
3. Create a new, local database called 'Streamus'
4. Run the test case 'ResetDatabase' to populate the database with tables and schema information.
5. Ensure all other test cases pass.
6. Run Streamus Server.

Supported Functionality
========

* YouTube search
* Add YouTube video to playlist
* Add YouTube playlist as playlist
* Add YouTube channel as playlist
* Play, pause, skip, rewind, shuffle, repeat video, repeat playlist
* Radio / Discovery
* Desktop notifications of currently playing video
* Customizable keyboard shortcuts to control play, pause, skip, previous
* Sharing of playlists via URL
* Enhancement of YouTube video pages with injected Streamus HTML
 
Usage Demo
========

A video explanation of how to use Streamus can be found at:
* "Streamus - Stream Bar Preview" - http://youtu.be/wjMLQWGYGOc

Authors
=======

* MeoMix - Original developer, main contributor.
* Misostc - Phenomenal user interfactor designer.
* MiracleBlue - Brought on as a second developer to help with work load.
