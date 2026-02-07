---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: eYY-co2060-project-template
title: Project Template
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# Project Title

---

## Team
-  E/22/330, R.Shathursima, [email](e22330@eng.pdn.ac.lk)
-  E/22/381, S.Monishs, [email](e22381@eng.pdn.ac.lk)
-  E/22/261, N.Sathurjika, [email](e22261@eng.pdn.ac.lk) 
-  E/22/260, K.Nithilaa, [email](e22260@eng.pdn.ac.lk)

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

Problem Domain
Farmers often rely on middle vendors to sell their products, which reduces their profit and limits direct interaction with customers. In Sri Lanka, farmers also face challenges such as limited access to agricultural equipment, lack of awareness about suitable loan options, insufficient expert guidance, unpredictable weather conditions, and limited knowledge of sustainable farming practices. There is no single platform that connects farmers with consumers, transport providers, agricultural experts, financial information, and local farming resources in real time, leading to inefficiencies and increased crop losses, particularly for locally cultivated Sri Lankan crops.

Proposed Solution
The proposed system, NagroMS (Networked Agro Management System), is a real-time, vendor-free digital platform primarily focused on supporting Sri Lankan farmers and Sri Lankan agricultural practices. The system connects farmers, customers, service providers, and agricultural experts while incorporating equipment rental, financial advisory support, weather-based insights, and intelligent farming guidance. The platform aims to improve transparency, encourage collaboration, reduce risks, and promote sustainable agricultural practices.



## Solution Architecture

The system supports multiple user roles including admin, farmer, customer, service provider, and expert. Farmers can add and manage product listings with real-time availability updates, focusing on locally grown Sri Lankan crops. Customers can browse products, communicate directly with farmers, and place order requests. Farmers can also list agricultural equipment for rent, enabling other farmers to rent equipment based on availability, location, and pricing. Service providers can offer transport and equipment maintenance services, while agricultural experts provide advisory support through real-time chat.

## Software Designs

The system features a weather-based alert module that provides timely updates and warnings for conditions such as heavy rainfall, drought, and extreme heat. Based on seasonal patterns and forecasted conditions, it suggests suitable crops and farming practices, helping farmers plan cultivation activities effectively and reduce crop losses.  Farm management tools allow farmers to track inventory of seeds, fertilizers, and pesticides.  An AI-powered chatbot is integrated to provide instant assistance, answer farming-related queries, and guide users through equipment rental, weather, and advisory services.
Technologies Used
The application will be developed as a web-based system using React for the frontend and Node.js with Express for the backend. Firebase Firestore will be used for real-time data storage, and Firebase Authentication will manage secure user access. Intelligent services such as weather-based insights, pest alerts, farm management, and the chatbot will be integrated into the system.
Expected Deliverables
## Testing

Testing done on software : detailed + summarized results

## Conclusion

What was achieved, future developments, commercialization plans

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
