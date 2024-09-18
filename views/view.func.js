function loadRequests() {
    fetch('/admin/requests/all/clients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la red');
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos de solicitudes recibidos:', data);
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '';

        if (Array.isArray(data) && data.length > 0) {

            data.sort((a, b) => {
                if (a.status === 'pendiente' && b.status === 'terminado') {
                    return -1;
                } else if (a.status === 'terminado' && b.status === 'pendiente') {
                    return 1;
                } else {
                    return 0; 
                }
            });

            data.forEach(request => {
                const requestBox = document.createElement('div');
                requestBox.className = 'request-box';
                requestBox.innerHTML = `
                    <p><strong>Título:</strong> ${request.title}</p>
                    <p><strong>Detalle:</strong> ${request.detail}</p>
                    <p><strong>Usuario:</strong> ${request.userId.name} (${request.userId.email})</p>
                    <p><strong>Estado:</strong> ${request.status}</p>
                    <p><strong>Calificación:</strong> ${request.rating || 'N/A'}</p>
                    <button type="button" onclick="viewRequestDetails('${request._id}')">Ver solicitud</button>
                `;
                contentArea.appendChild(requestBox);
            });
        } else {
            contentArea.innerHTML = '<p>No se encontraron solicitudes.</p>';
        }
    })
    .catch(error => {
        console.error('Error al cargar las solicitudes:', error);
        document.getElementById('content-area').innerHTML = '<p>Error al cargar las solicitudes.</p>';
    });
}

function viewRequestDetails(requestId) {
    fetch(`/admin/request/${requestId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const contentArea = document.getElementById('content-area');
        if (data && data.userId) {
            
            contentArea.innerHTML = `
                <div id="request-details">
                 <a href="" onclick="${closeRatingModal()}">×</a>
                    <h2>Detalles de la Solicitud</h2>
                    <p><strong>Título:</strong> ${data.title}</p>
                    <p><strong>Detalle:</strong> ${data.detail}</p>
                    <p><strong>Usuario:</strong> ${data.userId.name} (${data.userId.email})</p>
                    <p><strong>Estado:</strong> ${data.status}</p>
                    <p><strong>Calificación:</strong> ${data.rating || 'N/A'}</p>
                    <h3>Ubicación del Cliente</h3>
                    <div id="map"></div>
                    <button id="finish-request-button" onclick="finishRequest('${data._id}')">Terminar solicitud</button>
                </div>
            `;
console.log(data.location, "location");

            initializeMap(data.location);
        } else {
            contentArea.innerHTML = '<p>Detalles de la solicitud no disponibles.</p>';
        }
    })
    .catch(error => {
        console.error('Error al cargar los detalles de la solicitud:', error);
        document.getElementById('content-area').innerHTML = '<p>Error al cargar los detalles de la solicitud.</p>';
    });
}

function initializeMap(location) {
    if (location && location.latitude && location.longitude) {
        const map = L.map('map').setView([location.latitude, location.longitude], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([location.latitude, location.longitude]).addTo(map)
            .bindPopup('Ubicación del cliente')
            .openPopup();
    } else {
        document.getElementById('map').innerHTML = '<p>No se proporcionó una ubicación válida.</p>';
    }
}
let prctsList =[];
let selectedProducts = [];

function filterProducts() {
  const searchValue = document.getElementById('search-products').value.toLowerCase();
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  if (searchValue.trim() === '') return;

  const filteredProducts = prctsList.filter(product =>
    product.nombre.toLowerCase().includes(searchValue)
  );
 
  filteredProducts.forEach(product => {
    const productDiv = document.createElement('div');
    const isChecked = selectedProducts.some(p => p.nombre === product.nombre); 
    productDiv.innerHTML = `
      <label>
        <input type="checkbox" value="${product.nombre}" ${isChecked ? 'checked' : ''} onclick="toggleProduct('${product.nombre}')">
        ${product.nombre}
      </label>
    `;
    productList.appendChild(productDiv);
    
  });
 
}

function toggleProduct(productName) {
    const searchInput = document.getElementById('search-products');
    searchInput.value="";   
  const existingProduct = selectedProducts.find(p => p.nombre === productName);
  
  if (existingProduct) {
    selectedProducts = selectedProducts.filter(p => p.nombre !== productName);
  } else {
    selectedProducts.push({ nombre: productName, cantidad: 0 });
  }

  renderSelectedProducts();
}

function renderSelectedProducts() {
  const selectedProductsDiv = document.getElementById('selected-products');
  selectedProductsDiv.innerHTML = ''; 

  selectedProducts.forEach(product => {
    const productRow = document.createElement('div');
    productRow.className = 'product-row';
    productRow.innerHTML = `
      <span>${product.nombre}</span>
      <input type="number" value="${product.cantidad}" min="1" onchange="updateProductQuantity('${product.nombre}', this.value)">
      <button class="remove-btn" onclick="removeProduct('${product.nombre}')">X</button>
    `;
    selectedProductsDiv.appendChild(productRow);
  });
}

function updateProductQuantity(productName, newQuantity) {
  selectedProducts = selectedProducts.map(p =>
    p.nombre === productName ? { ...p, cantidad: Number(newQuantity) } : p
  );
}

function removeProduct(productName) {
  selectedProducts = selectedProducts.filter(p => p.nombre !== productName);
  renderSelectedProducts();
  filterProducts(); 
}

function finishRequest(requestId) {
    document.getElementById('rating-modal').style.display = 'block';

    document.getElementById('finish-request-confirm-button').onclick = function() {
        let totalStars = 0;
        let rating=0;
        selectedProducts.forEach(selectedProduct => {
            const productInList = prctsList.find(p => p.nombre === selectedProduct.nombre);
            if (productInList) {
                if (selectedProduct.cantidad==0 || selectedProduct.cantidad == "") {
                    alert("Debe poner cantidades válidas");
                    location.reload();
                }else{
                    totalStars += productInList.puntos * selectedProduct.cantidad;
                console.log("Total estrellas ganadas:",productInList, totalStars);
                rating= totalStars;
                }
            }
        });
       
        if (rating<=0) {
            alert("Ingrese la cantidad");
            location.reload(); 
        }else{
     fetch(`/admin/request/finish/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
                },
                body: JSON.stringify({rating: rating })
            })
            .then(response => {
                if (response.ok) {
                    alert('Solicitud terminada exitosamente.');
                    closeRatingModal();
                    loadRequests();
                } else {
                    alert('Error al terminar la solicitud.');
                }
            })
            .catch(error => {
                console.error('Error al terminar la solicitud:', error);
                alert('Error al terminar la solicitud.');
            });
        }
    }; 
}
function closeRatingModal() {
    document.getElementById('rating-modal').style.display = 'none';
}

let allClients = []; 


function loadClients(page = 1) {
    const url = `/admin/clients?page=${page}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => response.json())
    .then(data => {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '';

        
        const searchForm = document.createElement('form');
        searchForm.innerHTML = `
            <input type="text" id="search-input" placeholder="Buscar por nombre o email" />
            <button type="button" onclick="searchClient()">Buscar</button>
            <br></br>
        `;
        contentArea.appendChild(searchForm);
        allClients = data.clients;
        renderClients(allClients);

        const paginationControls = document.createElement('div');
        paginationControls.className = 'pagination-controls';
        paginationControls.innerHTML = `
            <button ${page === 1 ? 'disabled' : ''} onclick="loadClients(${page - 1})">Anterior</button>
            <span>Página ${page} de ${data.totalPages}</span>
            <button ${page >= data.totalPages ? 'disabled' : ''} onclick="loadClients(${page + 1})">Siguiente</button>
        `;
        contentArea.appendChild(paginationControls);
    })
    .catch(error => {
        console.error('Error al listar los clientes:', error);
        document.getElementById('content-area').innerHTML = '<p>Error al cargar los clientes.</p>';
    });
}
function renderClients(clients) {
    const contentArea = document.getElementById('content-area');
    const clientContainer = document.createElement('div');
    clientContainer.className = 'client-container';

    clients.forEach(client => {
        const clientBox = document.createElement('div');
        clientBox.className = 'client-box';
        clientBox.innerHTML = `
            <p><strong>Nombre:</strong> ${client.name} ${client.lastName}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Documento:</strong> ${client.doc}</p>
            <p><strong>Dirección:</strong> ${client.address}</p>
            <p><strong>Teléfono:</strong> ${client.phone}</p>
        `;
        
        clientBox.addEventListener('click', () => toggleClientDetails(clientBox, client._id));
        clientContainer.appendChild(clientBox);
    });

    contentArea.appendChild(clientContainer);
}

function searchClient() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filteredClients = allClients.filter(client => {
        const fullName = `${client.name} ${client.lastName}`.toLowerCase();
        const email = client.email.toLowerCase();
        return fullName.includes(searchQuery) || email.includes(searchQuery);
    });

    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '';

    const searchForm = document.createElement('form');
    searchForm.innerHTML = `
        <input type="text" id="search-input" placeholder="Buscar por nombre o email" value="${searchQuery}" />
        <button type="button" onclick="searchClient()">Buscar</button>
    `;
    contentArea.appendChild(searchForm);

    renderClients(filteredClients);
}

function toggleClientDetails(clientBox, clientId) {
    const isExpanded = clientBox.classList.contains('expanded');
    
    if (isExpanded) {
        clientBox.querySelector('.client-requests').remove();
        clientBox.classList.remove('expanded');
    } else {
   
        fetch(`/admin/clients/${clientId}/requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
            }
        })
        .then(response => response.json())
        .then(requests => {
            const requestContainer = document.createElement('div');
            requestContainer.className = 'client-requests';
            if (requests.length > 0) {
                requests.forEach(request => {
                    const requestBox = document.createElement('div');
                    requestBox.className = 'request-box';
                    requestBox.innerHTML = `
                        <p><strong>Título:</strong> ${request.title}</p>
                        <p><strong>Detalle:</strong> ${request.detail}</p>
                        <p><strong>Estado:</strong> ${request.status}</p>
                        <button class="request-button" onclick="viewRequestDetails('${request._id}')">Ver solicitud</button>
                    `;
                    requestContainer.appendChild(requestBox);
                });
            } else {
                requestContainer.innerHTML = '<p>No hay solicitudes para este cliente.</p>';
            }
            clientBox.appendChild(requestContainer);
            clientBox.classList.add('expanded');
        })
        .catch(error => console.error('Error al cargar solicitudes del cliente:', error));
    }
}

document.getElementById('solicitudes-link').addEventListener('click', function(event) {
    event.preventDefault();
    loadRequests();
});
  
  document.getElementById('clientes-link').addEventListener('click', function(event) {
    event.preventDefault();
    loadClients(1); 
});


document.getElementById('productos-link').addEventListener('click', function(event){
    loadProductManagement();
})
function loadProductManagement() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="product-management-container">
        <h2>Productos</h2>
        <div class="products-table-container">
          <table id="products-table">
  <thead>
    <tr>
      <th>Nombre</th>
      <th>Puntos</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody id="products-list">
    <!-- Aquí se llenarán las filas de productos -->
    <tr>
      <td>Nombre del Producto</td>
      <td>
        <input type="number" class="point" id="points-productId" value="100" />
      </td>
      <td>
        <button onclick="updateProduct('productId')">Actualizar</button>
      </td>
    </tr>
  </tbody>
</table>
        </div>
        <div class="create-product-form-container">
          <h3>Crear nuevo producto</h3>
          <form id="create-product-form">
            <input type="text" id="new-product-name" placeholder="Nombre del producto" required />
            <input type="number" id="new-product-points" placeholder="Puntos por kilo" required />
            <button type="submit">Crear</button>
          </form>
        </div>
      </div>
    `;

    fetchProducts();
}

  function fetchProducts() {
    fetch('admin/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }) 
    
      .then(response => response.json())
      .then(data => {
        const products = data.products;
        console.log(products);
        prctsList=products;
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = ''; 
  
        products.forEach(product => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${product.nombre}</td>
            <td>
              <input type="number" class="point" id="points-${product._id}" value="${product.puntos}" />
            </td>
            <td>
              <button onclick="updateProduct('${product._id}')">Actualizar</button>
            </td>
          `;
          productsList.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Error al obtener productos:', error);
      });
  }
  function updateProduct(productId) {
    const pointsInput = document.getElementById(`points-${productId}`);
    const newPoints = pointsInput.value;
  
    fetch(`admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ puntos: newPoints })
    })
      .then(response => response.json())
      .then(data => {
        alert('Producto actualizado correctamente');
      })
      .catch(error => {
        console.error('Error al actualizar producto:', error);
        alert('Error al actualizar producto');
      });
  }
  document.getElementById('content-area').addEventListener('submit', function(event) {
    if (event.target && event.target.id === 'create-product-form') {
      event.preventDefault(); 
  
      const nombre = document.getElementById('new-product-name').value;
      const puntos = document.getElementById('new-product-points').value;
  
      fetch('admin/create/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, puntos })
      })
        .then(response => response.json())
        .then(data => {
          alert('Producto creado correctamente');
          loadProductManagement();
        })
        .catch(error => {
          console.error('Error al crear producto:', error);
          alert('Error al crear producto');
        });
    }
  });