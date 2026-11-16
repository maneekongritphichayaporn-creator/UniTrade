# UniTrade — System Documentation

**Project:** UniTrade Campus Marketplace Platform  
**Document:** System Diagrams, Wireframes & User Interface

---

# 1. Entity Relationship Diagram (ER Diagram)

## 1.1 Overview

The Entity Relationship Diagram (ER Diagram) illustrates the database structure of the UniTrade system, including entities, attributes, primary keys (PK), foreign keys (FK), and relationships.

It provides an overview of how user information, product listings, categories, pickup locations, reports, wishlists, and product images are organized and connected within the database.

## 1.2 ER Diagram

![ER Diagram](images/erdiagram/ER-Diagram.png)

---

# 2. Sequence Diagrams

## 2.1 Overview

Sequence Diagrams illustrate the interactions and communication between users, the user interface, backend services, storage, and the database during specific system operations.

Each diagram represents the workflow of a particular Use Case (UC) in the UniTrade system.

## 2.2 UC-01: Register & Sign In

Illustrates the registration and authentication processes, including interactions between users, the user interface, and backend services.

![Sequence Diagram UC-01](images/sequencediagram/Sequence-Diagram-UC01.png)

## 2.3 UC-02: Create Product Post

Illustrates how a user creates a new product listing by submitting product information, selecting a pickup location, and uploading product images.

![Sequence Diagram UC-02](images/sequencediagram/Sequence-Diagram-UC02.png)

## 2.4 UC-03: Update Post Status

Illustrates how a seller updates the status of an existing product listing.

![Sequence Diagram UC-03](images/sequencediagram/Sequence-Diagram-UC03.png)

## 2.5 UC-04: Search & Filter Goods

Illustrates how users search for products and apply filters to find listings that match their requirements.

![Sequence Diagram UC-04](images/sequencediagram/Sequence-Diagram-UC04.png)

## 2.6 UC-05: Save to Wishlist

Illustrates how users save products to their Wishlist and manage their saved listings.

![Sequence Diagram UC-05](images/sequencediagram/Sequence-Diagram-UC05.png)

## 2.7 UC-06: Report Post

Illustrates how users submit reports about product listings that may violate the platform's rules.

![Sequence Diagram UC-06](images/sequencediagram/Sequence-Diagram-UC06.png)

## 2.8 UC-07: Moderate Posts

Illustrates how administrators review reported product listings and decide whether to delete an inappropriate post or dismiss a report.

![Sequence Diagram UC-07](images/sequencediagram/Sequence-Diagram-UC07.png)

---

# 3. Wireframes

## 3.1 Overview

The Wireframes illustrate the planned structure, layout, and navigation of the UniTrade application before implementation.

They focus on the arrangement of interface elements, content sections, and user interactions.

## 3.2 Home / Catalog

Illustrates the main product browsing page, where users can explore available listings and navigate through product categories.

![Home / Catalog Wireframe](images/uiwireframe/Home.png)

## 3.3 Product Detail

Illustrates the product detail page, displaying product information, images, seller details, and available actions.

![Product Detail Wireframe](images/uiwireframe/Product-Detail.png)

## 3.4 Create Listing

Illustrates the interface for creating a new product listing by entering product details, selecting a category and pickup location, and uploading images.

![Create Listing Wireframe](images/uiwireframe/Create-Listing.png)

## 3.5 Wishlist

Illustrates the page where users can view and manage products saved to their Wishlist.

![Wishlist Wireframe](images/uiwireframe/Wishlist.png)

## 3.6 Profile

Illustrates the user's profile page, including personal information and account details.

![Profile Wireframe](images/uiwireframe/Profile.png)

## 3.7 My Listings

Illustrates the page where sellers can view and manage their own product listings.

![My Listings Wireframe](images/uiwireframe/My-Listings.png)

## 3.8 Admin Dashboard

Illustrates the administrative dashboard used to manage and monitor reported product listings and moderation activities.

![Admin Dashboard Wireframe](images/uiwireframe/Admin-Dashboard.png)

---

# 4. User Interface (UI)

## 4.1 Overview

The User Interface (UI) section presents the visual design and implemented interface of the UniTrade application.

It demonstrates how the wireframe concepts are translated into the actual application interface.

## 4.2 Home / Catalog

![Home / Catalog UI](images/uiguideline/Home.png)

## 4.3 Product Detail

![Product Detail UI](images/uiguideline/Product-Detail.png)

## 4.4 Create Listing

![Create Listing UI](images/uiguideline/Create-Listing.png)

## 4.5 Wishlist

![Wishlist UI](images/uiguideline/Wishlist.png)

## 4.6 Profile

![Profile UI](images/uiguideline/Profile.png)

## 4.7 My Listings

![My Listings UI](images/uiguideline/My-Listings.png)

## 4.8 Admin Dashboard

![Admin Dashboard UI](images/uiguideline/Admin-Dashboard.png)

---

# 5. Notes

- All diagrams and interface images are provided for system documentation and reference.
- Sequence Diagrams describe the interactions and workflows of the corresponding Use Cases.
- Wireframes represent the planned interface structure and layout.
- UI screenshots represent the visual interface of the application.
- The documentation distinguishes between planned system functionality and implemented features where applicable.
