# Carl's Sheety Situation

![Carl Sheety Situation Screenshot](https://raw.githubusercontent.com/jamsinclair/CarlsSheetySituation/master/images/css-screenshot.png "Carl Sheety Situation Screenshot")

First attempt at a Html5 interactive game/website using canvas element (Also first Git repo!).

Still work in progress. 

[View Game and Website Here](http://jamsinclair.co.nz/carl/)

## Acknowledgements

[Gustavo Carvalho's answer](http://stackoverflow.com/a/16926273) on stackoverflow was very informative for my project and I benefitted from his basic js classes for Camera, Maps and Rectangle. His post really got my head around the viewport situation for a game. Much thanks.

I found the tutorials from [Sam Lancanshire's website](http://html5gamedev.samlancashire.com) very informative with playing around with/animating the canvas element. I used his simple FPS counter object to monitor the fps for my game. 

At the moment I'm using [tocca.js by GianlucaGuarini](http://gianlucaguarini.github.io/Tocca.js/), a great lightweight touch event handler script. 

## Project Info
I thought I'd take the hard route seeing as I'm learning and very new to coding. So no game or physics libraries used. 

I've used some borrowed code as mentioned in the acknowledgements and a great simple script for touch events, tocca.js. I tried to avoid using Jquery, only using for some quick DOM manipulation and animation for website. 

A lot of messy code by me :kissing_smiling_eyes::notes:

I tried to render as much of the graphics as I could using canvas functions, I think I've only used two external images for an Intro scene. (A lot of optimisation still needed for the rendering, very messy).

## About 

This project was part of an assignment for a Web Development course I am studying. 

The main focus of the assignment being on responsive design and Html5 technologies. We had the blessing of not having to support older browsers IE8 or lower etc.

We also had to make a feature out of one or more of the following:

* Local Storage/WebSQL
* Geolocation API
* Canvas or SVG Elements

I chose the latter as I was interested in making some sort of Html5 game.

Carl's Sheety Situtaion is currently a game in progress. It is a simple game about an unfortunate front-end developer, Carl, who has lost all the CSS files. The current website has no styling, navigate his desktop to find all the files and restore the website to normal.Your progress is kept updated in your browser's local storage.

It was made over a period of three and half weeks. I might continue development and refine it as the javascript code is very rushed and the game is still a very rough build. 

If I ever were to continue the development of this, I've been pondering whether to add a game mechanic such as limited time to find the files or perhaps making it more a puzzler. The other option could to be make it educational as a fun introduction to css. 

To quote a friend/tester:

> "It took me 30 seconds, how is it even a game?"

I don't know why you would but you're welcome to poke around my files or expand upon the project if you wish (you'd have to be crazy). Be warned I take no responsibility for any **injuries**, **mental** or **physical**, from even glancing at this project.  

## Known Issues

Pretty much won't work on anything but latest browsers

  * **iPhones** and **Androids** using Chrome/Opera/Safari seem to have bug which affects cursor movement often making it eratic or go to wrong coords. I'm a bit stumped on this one but I've got a feeling it's most likely due to the Game scaling I have in place, as the **Ipad 2** I was testing on with same browsers ran the game and cursor movements okay.  
  
  * **Mobile Firefox** browsers seem to ignore tap event, the game still remains playable with unexpected but actually intuitive cursor movement (I think it's using the mousemove event to update cursor).
  
  * As I expected quite low fps on most mobile devices, my rendering probably needs a lot of optimisation. I've attempted pre-rendering by saving rendered images as a Data URI at load in an attempt to help. But wonder whether redrawing the path each frame is less of a performance cost, due to mostly simple paths. 
