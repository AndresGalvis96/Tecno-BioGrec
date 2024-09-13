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

function finishRequest(requestId) {
    document.getElementById('rating-modal').style.display = 'block';

    document.getElementById('finish-request-confirm-button').onclick = function() {
        const rating = parseInt(document.getElementById('rating-input').value, 10);
      
        if (rating > 0 && rating < 100) {
            console.log(rating, "calificación");
            fetch(`/admin/request/finish/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
                },
                body: JSON.stringify({ rating: rating })
                
        
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
        } else {
            alert('Por favor, ingresa una calificación válida entre 1 y 100.');
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

document.addEventListener('DOMContentLoaded', function() {
    fetch('/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data) {
        const userType = data.type;
        console.log(data.type);
        if (userType === 'admin') {
          document.getElementById('mi-perfil-link').style.display = 'none';
          document.getElementById('solicitar-link').style.display = 'none';
          document.getElementById('listar-link').style.display = 'none';
          document.getElementById('asistencia-link').style.display = 'none'; 
          
          document.getElementById('solicitudes-link').style.display = 'block'; 
          document.getElementById('clientes-link').style.display = 'block'; 
          loadRequests()
        } else {
            document.getElementById('content-area').innerHTML = '<img src="img/inst.png" id="fondo-inicio">';
          document.getElementById('solicitudes-link').style.display = 'none';
          document.getElementById('clientes-link').style.display = 'none';
        }
      } else {
        document.getElementById('content-area').innerHTML = '<p>No se pudieron obtener los datos del usuario.</p>';
      }
    })
    .catch(error => {
      console.error('Error al obtener los datos del usuario:', error);
      document.getElementById('content-area').innerHTML = '<p>Error al cargar los datos del usuario.</p>';
    });

  });
  
  document.getElementById('clientes-link').addEventListener('click', function(event) {
    event.preventDefault();
    loadClients(1); 
});

document.getElementById('mi-perfil-link').addEventListener('click', function(event) {
    event.preventDefault();

    fetch('/auth/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            const userId = data._id;
            console.log(data.userId);
            
            fetch(`/auth/points/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
                }
            })
            .then(response => response.json())
            .then(pointsData => {
                const pointsBanner = pointsData.totalPoints > 0 
                    ? `<div id="stars"><h3>Mis Estrellas: ${pointsData.totalPoints}</h3></div>` 
                    : `<h3>Aún no has ganado estrellas</h3>`;

                document.getElementById('content-area').innerHTML = `
                    ${pointsBanner}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div style="flex: 1; margin-right: 20px;">
                            <h3>Datos personales</h3>
                            <p><strong>Nombre:</strong> ${data.name}</p>
                            <p><strong>Apellido:</strong> ${data.lastName}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Dirección:</strong> ${data.address}</p>
                        </div>
                        <div style="flex: 1;">
                            <h3>Editar datos</h3>
                            <label for="edit-name">Nombre:</label>
                            <input type="text" id="edit-name" value="${data.name}" style="display: block; margin-bottom: 10px;" />
                            <label for="edit-lastName">Apellido:</label>
                            <input type="text" id="edit-lastName" value="${data.lastName}" style="display: block; margin-bottom: 10px;" />
                            <label for="edit-address">Dirección:</label>
                            <input type="text" id="edit-address" value="${data.address}" style="display: block; margin-bottom: 20px;" />
                            
                        </div>
                    </div>
                    <label>
                                <input type="checkbox" id="use-current-location" />
                                ¿Usar ubicación actual como predeterminada?
                            </label>
                    <div id="map" style="height: 300px; width: 100%;"></div>
                    <button id="save-button">Guardar cambios</button>
                `;

            let lat, lon;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;

                    const map = L.map('map').setView([lat, lon], 14);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);

                    L.marker([lat, lon]).addTo(map)
                        .bindPopup('Estás aquí')
                        .openPopup();
                });
            }

            document.getElementById('save-button').addEventListener('click', function() {
                const name = document.getElementById('edit-name').value;
                const lastName = document.getElementById('edit-lastName').value;
                const address = document.getElementById('edit-address').value;
                const useCurrentLocation = document.getElementById('use-current-location').checked;

                const updateData = {
                    name: name,
                    lastName: lastName,
                    address: address
                };

                if (useCurrentLocation && lat && lon) {
                    updateData.location = { latitude: lat, longitude: lon };
                }

                fetch('/auth/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
                    },
                    body: JSON.stringify(updateData)
                })
                .then(response => response.json())
                .then(updatedData => {
                    if (updatedData) {
                        alert('Datos actualizados exitosamente.');
                    } else {
                        alert('No se pudieron actualizar los datos.');
                    }
                })
                .catch(error => {
                    console.error('Error al actualizar los datos del usuario:', error);
                    alert('Error al guardar los cambios.');
                });
            });
        })
        .catch(error => {
            console.error('Error al obtener los puntos del usuario:', error);
            document.getElementById('content-area').innerHTML = '<p>Error al cargar los puntos del usuario.</p>';
        });
        } else {
            document.getElementById('content-area').innerHTML = '<p>No se pudieron obtener los datos del usuario.</p>';
        }
    })
    .catch(error => {
        console.error('Error al obtener los datos del usuario:', error);
        document.getElementById('content-area').innerHTML = '<p>Error al cargar los datos del usuario.</p>';
    });
});

document.getElementById('solicitar-link').addEventListener('click', function(event) {
    event.preventDefault(); 

    document.getElementById('content-area').innerHTML = `
       <di id="requ-content">
    <h2>Redactar Solicitud</h2>
        <div id="formulario-solicitud"> 
            <form id="request-form">
                <label for="request-title">Razón/detalle/asunto:</label>
                <input type="text" id="request-title" placeholder="Razón/detalle/asunto" required>
                <p>Detalla el contenido de la solicitud</p>
                <textarea id="request-detail" placeholder="Describe detalladamente tu solicitud..." required></textarea>
                <label>
                    <input type="checkbox" id="use-current-location" />
                    ¿Usar ubicación actual para esta solicitud?
                </label>
                <button type="submit">Enviar Solicitud</button>
            </form>
        </div>
        </div>
    `;

    document.getElementById('request-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('request-title').value;
        const detail = document.getElementById('request-detail').value;
        const useCurrentLocation = document.getElementById('use-current-location').checked;

        if (!title || !detail) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        if (useCurrentLocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                sendRequest({ title, detail, location });
            }, function(error) {
                console.error('Error al obtener la ubicación:', error);
                alert('No se pudo obtener la ubicación.');
                sendRequest({ title, detail });
            });
        } else {
            sendRequest({ title, detail });
        }
    });

    function sendRequest(requestData) {
        fetch('/auth/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                alert('Solicitud enviada exitosamente.');
                document.getElementById('request-title').value = '';
                document.getElementById('request-detail').value = '';
            } else {
                alert('No se pudo enviar la solicitud.');
            }
        })
        .catch(error => {
            console.error('Error al enviar la solicitud:', error);
            alert('Error al enviar la solicitud.');
        });
    }
});

document.getElementById('listar-link').addEventListener('click', function(event) {
    event.preventDefault();

    fetch('/auth/requests/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => response.json())
    .then(data => {
        const requestsList = document.getElementById('content-area');
        requestsList.innerHTML = ''; 
        const titl= document.createElement('h2');
        titl.innerHTML='<h3>Solicitudes</h3>';
        if (data && data.length > 0) {
            console.log(data);
            requestsList.appendChild(titl);
            data.forEach(request => {
                const date = new Date(request.createdAt);
                const formattedDate = isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
                
                const ratingText = request.rating !== null ? request.rating : '<sin puntos asignados>';
            
                const requestElement = document.createElement('div');
                requestElement.innerHTML = `
  
                <div class="request-card">
                    <div class="request-title">${request.title}</div>
                    <div class="request-date">${formattedDate}</div>
                    <div class="request-rating">#Estrellas asignadas: ${ratingText}</div>
                </div>
                ` ;
                requestsList.appendChild(requestElement);
            });
            
        } else {
            requestsList.innerHTML = '<p>No se encontraron solicitudes.</p>';
        }
    })
    .catch(error => {
        console.error('Error al listar las solicitudes:', error);
        alert('Error al listar las solicitudes.');
    });
});

document.getElementById('cerrar-sesion').addEventListener('click', function(event) {
    event.preventDefault();

    fetch('/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => {
        if (response.ok) {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            window.location.href = '/';
        } else {
            alert('Error al cerrar sesión.');
        }
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión.');
    });
});
