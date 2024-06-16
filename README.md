

The Cartridge Dashboard is a web-based application designed to manage and track the usage, issuance, and purchase of printer cartridges within an organization. It provides an easy-to-navigate interface to view different aspects of cartridge management, including announcements, trending data, and detailed statistics on pages used per department.
Features

    Dashboard Overview: A centralized view of all cartridge-related activities.
    Cartridge Issued: Section showing details about the issued cartridges.
    Cartridge Purchased: Section displaying information on purchased cartridges.
    Pages Used per Department: A detailed breakdown of the number of pages used by each department, with a pie chart visualization.
    User Management: Icons and notifications to manage user interactions.

Technologies Used

    HTML5
    CSS3
    JavaScript (ES6)
    NodeJs
    Express
    SQLite DB
    D3.js: For data visualization.
    

Getting Started
Prerequisites

To run this project, you need a web browser and a web server to serve the static files. You can use a simple server like Live Server in VSCode or any other static server of your choice.
Installation

```bash
    git clone https://github.com/your-username/cartridge-dashboard.git
    cd cartridge-dashboard
    node app.js
```
Folder Structure

    index.html: The main HTML file for the dashboard.
    style.css: Contains all the styling rules for the dashboard.
    js/main.js: JavaScript file that contains the logic for data manipulation and rendering.
    font/: Folder containing Font Awesome files.
    favicon/: Contains the favicon files for the dashboard.

Running the Dashboard

After setting up the local server, navigate to http://localhost:5500 (or the port provided by your server) to view the dashboard.
Usage

    Search Bar: Use the search bar at the top to search through the data.
    Navigation: Use the sidebar to navigate between different sections like Home, Printers, Cartridge, History, Tasks, and Communities.
    User Management: Access user-related actions through the icons at the top-right corner.

Contributing

If you wish to contribute to the project, please fork the repository and submit a pull request. Ensure that your code adheres to the existing code style and include comments where necessary.

```bash

git checkout -b feature/YourFeature

git commit -m 'Add some feature'
    
git push origin feature/YourFeature

git push origin feature/YourFeature


```


License

This project is licensed under the MIT License. See the LICENSE file for details.
Acknowledgements

    Font Awesome for icons.
    Google Fonts for providing the Roboto font.
    D3.js for data visualization capabilities.
