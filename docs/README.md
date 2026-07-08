---
layout: home
permalink: index.html
repository-name: e22-co2060-nagroms
title: NagroMS - Networked agro Management System
---

# Networked Agro Management System (NagroMS)

NagroMS is a web-based platform designed to connect farmers directly with bulk buyers, retail shops, and individual customers. The system aims to reduce dependency on middle vendors and improve farmers’ profit margins by enabling transparent and direct trading.
NagroMS creates a centralized digital marketplace that improves efficiency, accessibility, and transparency in the agricultural supply chain.

## Team
-  E/22/330, R.Shathursima, e22330@eng.pdn.ac.lk
-  E/22/381, S.Monisha, e22381@eng.pdn.ac.lk
-  E/22/261, N.Sathurjika, e22261@eng.pdn.ac.lk
-  E/22/260, K.Nithilaa, e22260@eng.pdn.ac.lk
 
#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

The Networked Agro Management System (NagroMS) is a web-based platform designed to connect farmers directly with bulk buyers such as grocery shops, food cities, and individual customers. The system aims to reduce the dependency on middle vendors who often decrease farmers’ profit margins. By creating a centralized digital marketplace, the platform improves transparency, ensures fair pricing, and enables direct communication between stakeholders. Additionally, the system integrates agricultural service providers such as transportation and plant-related medical services, making it a complete ecosystem for agricultural trade and support.

## Solution Architecture

NagroMS follows a client-server architecture using the MERN stack. The frontend handles user interaction and sends requests to the backend through RESTful APIs. The backend processes business logic, manages authentication, and communicates with the Firebase as database for data storage and retrieval. JWT-based authentication ensures secure login and role-based access control. The system supports multiple user roles including farmers, buyers, service providers, and administrators, ensuring structured and secure operations.

## Software Designs

The system is designed with modular components including user management, product management, order management, service management, and admin control. Farmers can register, list products, and manage inventory. Buyers can browse products, place orders, and track purchases. Service providers can register their services for agricultural support. The database structure is organized into collections such as users, products, orders, and services, ensuring efficient data handling and scalability.

## Testing

The system undergoes multiple levels of testing including unit testing for backend functions, API testing using Postman, integration testing to verify frontend-backend communication, and user acceptance testing to ensure system usability. Security testing is also implemented to validate JWT authentication and role-based authorization mechanisms, ensuring safe and reliable system performance.

## Conclusion

NagroMS provides a practical digital solution to improve the agricultural supply chain by directly connecting farmers with buyers and service providers. The platform enhances profit margins, improves transparency, and reduces unnecessary intermediaries. With scalable architecture and secure authentication mechanisms, the system can be further enhanced in the future with features such as online payments, real-time chat, and mobile application integration.

## Links

- [Project Repository:](https://github.com/cepdnaclk/e22-co2060-nagroms)
- [Project Page:](https://cepdnaclk.github.io/e22-co2060-NagroMS)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya:](https://eng.pdn.ac.lk/)

