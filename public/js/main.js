document.addEventListener('DOMContentLoaded', async () => {
    const responses = await Promise.all([
        fetch('/api/cartridge-issued'),
        fetch('/api/cartridge-purchased'),
        fetch('/api/printers'),
        fetch('/api/cartridges'),
        fetch('/api/employee')
    ]);

    const [issuedData, purchasedData, printerData, cartridgeData, employeeData] = await Promise.all(responses.map(res => res.json()));

    const announcementsSection = document.getElementById('announcements');
    if (announcementsSection) {
        announcementsSection.innerHTML = issuedData.map(({ empid, empname, cid, quantity, date, department }) => `
            <div class="announcement">
                <h3>${empname}</h3>
                <p>Employee ID: ${empid}</p>
                <p>Cartridge ID: ${cid}</p>
                <p>Quantity: ${quantity}</p>
                <p>Date: ${date}</p>
                <p>Department: ${department}</p>
            </div>
        `).join('');
    } else {
        console.error('Element with ID "announcements" not found.');
    }

    const trendingSection = document.getElementById('trending');
    if (trendingSection) {
        trendingSection.innerHTML = purchasedData.map(({ rid, cid, receipt_name, cost, quantity, date }) => `
            <div class="trending-item">
                <div class="trending-item-info">
                    <div class="trending-item-username">Name: ${receipt_name}</div>
                    <div class="trending-item-title">Cartridge ID: ${cid}</div>
                    <p>Cost: ${cost}</p>
                    <p>Quantity: ${quantity}</p>
                    <p>Date: ${date}</p>
                </div>
            </div>
        `).join('');
    } else {
        console.error('Element with ID "trending" not found.');
    }
    
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        projectsSection.innerHTML = printerData.map(({ pid, pname, cost, vendor, quantity, drum, date }) => `
            <div class="project-card">
                <h3 class="project-title">${pname}</h3>
                <div class="project-description">
                    <ul>
                        <li>Cost: ${cost}</li>
                        <li>Vendor: ${vendor}</li>
                        <li>Quantity: ${quantity}</li>
                        <li>Drum: ${drum}</li>
                        <li>Date: ${date}</li>
                    </ul>
                </div>
            </div>
        `).join('');
    } else {
        console.error('Element with ID "projects" not found.');
    }

    const cartridgesSection = document.getElementById('cartridges');
    if (cartridgesSection) {
        cartridgesSection.innerHTML = cartridgeData.map(({ cid, name, cost, vendor, pageYield, quantity, date }) => `
            <div class="cartridge-card">
                <h3 class="cartridge-title">${name}</h3>
                <div class="cartridge-description">
                    <ul>
                        <li>cid: ${cid}</li>
                        <li>Cost: ${cost}</li>
                        <li>Vendor: ${vendor}</li>
                        <li>Quantity: ${quantity}</li>
                        <li>Yield: ${pageYield}</li>
                        <li>Date: ${date}</li>
                    </ul>
                </div>
            </div>
        `).join('');
    } else {
        console.error('Element with ID "cartridges" not found.');
    }

    const addCartridgeForm = document.getElementById('add-cartridge-form');
    if (addCartridgeForm) {
        addCartridgeForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(addCartridgeForm);
            const data = {
                name: formData.get('name'),
                printer_id: formData.get('printer_id'),
                cost: formData.get('cost'),
                vendor: formData.get('vendor'),
                yield: formData.get('yield'),
                quantity: formData.get('quantity')
            };

            try {
                const response = await fetch('/api/add-cartridge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const responseData = await response.json();
                alert(responseData.message);
                window.location.href = '/cartridges';
            } catch (error) {
                console.error('Error adding cartridge:', error);
            }
        });
    } else {
        console.error('Element with ID "add-cartridge-form" not found.');
    }



    const tableContainer = document.getElementById('pages-used-table');
    if (tableContainer) {
        const pagesUsedPerDepartment = {};

        employeeData.forEach(employee => {
            const cartridge = cartridgeData.find(c => c.cid === employee.cid);
            if (cartridge) {
                const pagesUsed = employee.quantity * cartridge.pageYield;
                if (pagesUsedPerDepartment[employee.department]) {
                    pagesUsedPerDepartment[employee.department] += pagesUsed;
                } else {
                    pagesUsedPerDepartment[employee.department] = pagesUsed;
                }
            }
        });

        const tableHTML = Object.keys(pagesUsedPerDepartment).map(department => `
            <tr>
                <td>${department}</td>
                <td>${pagesUsedPerDepartment[department]}</td>
            </tr>
        `).join('');

        tableContainer.innerHTML = `
            <table class="styled-table">
                <thead>
                    <tr class="active-row">
                        <th>Department</th>
                        <th>Pages Used</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableHTML}
                </tbody>
            </table>
        `;

        // Prepare data for pie chart
        const departments = Object.keys(pagesUsedPerDepartment);
        const pieData = departments.map(department => ({
            department: department,
            pagesUsed: pagesUsedPerDepartment[department]
        }));

        // D3.js pie chart setup
        const width = 200;
        const height = 200;
        const radius = Math.min(width, height) / 2;

        const color = d3.scaleOrdinal()
            .domain(departments)
            .range(d3.schemeCategory10);

        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        const pie = d3.pie()
            .sort(null)
            .value(d => d.pagesUsed);

        const svg = d3.select("#pie-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const g = svg.selectAll(".arc")
            .data(pie(pieData))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", (d, i) => color(d.data.department));

        // Optional: Add legend
        const legend = svg.selectAll(".legend")
            .data(departments)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d, i) => color(departments[i]));

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d);

    } else {
        console.error('Element with ID "pages-used-table" not found.');
    }

    // Prepare data for employees with most pages printed
    const pagesUsedPerEmployee = {};

    employeeData.forEach(employee => {
        const cartridge = cartridgeData.find(c => c.cid === employee.cid);
        if (cartridge) {
            const pagesUsed = employee.quantity * cartridge.pageYield;
            pagesUsedPerEmployee[employee.empname] = pagesUsed;
        }
    });

    // Sort employees based on pages printed (descending order)
    const sortedEmployees = Object.keys(pagesUsedPerEmployee).sort((a, b) => pagesUsedPerEmployee[b] - pagesUsedPerEmployee[a]);

    // Build HTML for the table
    const tHTML = sortedEmployees.map(employee => `
        <tr>
            <td>${employee}</td>
            <td>${pagesUsedPerEmployee[employee]}</td>
            <td>${employeeData.find(e => e.empname === employee).department}</td>
        </tr>
    `).join('');

    // Create table element and append to tContainer
    const tableElement = document.createElement('table');
    tableElement.classList.add('styled-table');
    tableElement.innerHTML = `
        <thead>
            <tr class="active-row">
                <th>Name</th>
                <th>Pages Printed</th>
                <th>Department</th>
            </tr>
        </thead>
        <tbody>
            ${tHTML}
        </tbody>
    `;

    // Append table to DOM
    const employeeUsedSection = document.querySelector('.employee-used-section'); // Use class selector if ID is incorrect
    if (employeeUsedSection) {
        employeeUsedSection.innerHTML = ''; // Clear existing content
        const tContainer = document.createElement('div');
        tContainer.innerHTML = `<h2>Employees with Most Pages Printed</h2>`;
        tContainer.appendChild(tableElement);
        employeeUsedSection.appendChild(tContainer);
    } else {
        console.error('Element with class "employee-used-section" not found.');
    }
});
