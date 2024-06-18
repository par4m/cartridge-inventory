document.addEventListener('DOMContentLoaded', async () => {
    const responses = await Promise.all([
        fetch('/api/cartridge-issued'),
        fetch('/api/cartridge-purchased'),
        fetch('/api/printers'),
        fetch('/api/cartridges'),
        fetch('/api/employee')
    ]);

    const [issuedData, purchasedData, printerData, cartridgeData, employeeData] = await Promise.all(responses.map(res => res.json()));

          // Section 1: Announcements (Issued Cartridges)
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


 // Section 2: Trending (Purchased Cartridges)
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

     // Section 3: Pages Used per Department
        const pagesUsedTable = document.getElementById('pages-used-table');
        if (pagesUsedTable) {
            const pagesUsedPerDepartment = {};

            issuedData.forEach(issue => {
                const cartridge = cartridgeData.find(c => c.cid === issue.cid);
                if (cartridge) {
                    const pagesUsed = issue.quantity * cartridge.pageYield;
                    if (pagesUsedPerDepartment[issue.department]) {
                        pagesUsedPerDepartment[issue.department] += pagesUsed;
                    } else {
                        pagesUsedPerDepartment[issue.department] = pagesUsed;
                    }
                }
            });
 const tableHTML = Object.keys(pagesUsedPerDepartment).map(department => `
                <tr>
                    <td>${department}</td>
                    <td>${pagesUsedPerDepartment[department]}</td>
                </tr>
            `).join('');

            pagesUsedTable.innerHTML = `
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

            // D3.js pie chart setup
            const departments = Object.keys(pagesUsedPerDepartment);
            const pieData = departments.map(department => ({
                department: department,
                pagesUsed: pagesUsedPerDepartment[department]
            }));
          // D3.js pie chart setup
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;

        const color = d3.scaleOrdinal()
            .domain(departments)
            .range(d3.schemeCategory10);

        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        const labelArc = d3.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

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
            .style("fill", d => color(d.data.department));

        g.append("text")
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("dy", ".35em")
            .text(d => d.data.department.charAt(0)); // Display only the first letter

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

    // Prepare data for top employees in each department
    const pagesUsedPerEmployee = {};

    employeeData.forEach(employee => {
        const cartridge = cartridgeData.find(c => c.cid === employee.cid);
        if (cartridge) {
            const pagesUsed = employee.quantity * cartridge.pageYield;
            if (!pagesUsedPerEmployee[employee.department]) {
                pagesUsedPerEmployee[employee.department] = [];
            }
            pagesUsedPerEmployee[employee.department].push({
                name: employee.empname,
                pagesUsed: pagesUsed,
                department: employee.department
            });
        }
    });



    try {
        // Fetch data from API
        const response = await fetch('/api/employee');
        const employeeData = await response.json();

        const cartridgeResponse = await fetch('/api/cartridges');
        const cartridgeData = await cartridgeResponse.json();
          
          // Aggregate data by empid
                const pagesByEmployee = {};

                issuedData.forEach(issue => {
                    const cartridge = cartridgeData.find(c => c.cid === issue.cid);
                    if (cartridge) {
                        const pagesUsed = issue.quantity * cartridge.pageYield;
                        if (!pagesByEmployee[issue.empid]) {
                            pagesByEmployee[issue.empid] = {
                                empid: issue.empid,
                                empname: issue.empname,
                                department: issue.department,
                                total: 0,
                                details: []
                            };
                        }
                        pagesByEmployee[issue.empid].total += pagesUsed;
                        pagesByEmployee[issue.empid].details.push({
                            cid: issue.cid,
                            quantity: issue.quantity,
                            date: issue.date,
                            pagesUsed: pagesUsed
                        });
                    }
                });

                // Generate HTML
                const tableHTML = Object.values(pagesByEmployee).map(employee => `
                    <tr>
                        <td>${employee.empid}</td>
                        <td>${employee.empname}</td>
                        <td>${employee.department}</td>
                        <td>
                            ${employee.details.map(detail => `
                                <div>
                                    <span>Cartridge ID: ${detail.cid}</span><br>
                                    <span>Quantity: ${detail.quantity}</span><br>
                                    <span>Date: ${detail.date}</span><br>
                                    <span>Pages Used: ${detail.pagesUsed}</span>
                                </div>
                            `).join('<br>')}
                        </td>
                        <td>${employee.total}</td>
                    </tr>
                `).join('');

                const issuedTableContainer = document.getElementById('issued-table');
                if (issuedTableContainer) {
                    issuedTableContainer.innerHTML = `
                        <table class="styled-table">
                            <thead>
                                <tr class="active-row">
                                    <th>Emp ID</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Cartridge Details</th>
                                    <th>Total Pages</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableHTML}
                            </tbody>
                        </table>
                    `;
                } else {
                    console.error('Element with ID "issued-table" not found.');
                }
            } catch (error) {
                console.error('Error fetching or displaying data:', error);
            }
        
});
