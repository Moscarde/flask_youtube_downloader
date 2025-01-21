document.addEventListener("DOMContentLoaded", () => {
    const videoTableBody = document.getElementById("video-table-body");
    const videoTableContainer = document.getElementById("video-table-container");
    const spinner = document.querySelector("#loading-spinner");
    const form = document.querySelector("#video-form");
    const inputField = form?.querySelector("input[name='video_url']");
    const submitButton = form?.querySelector("button[type='submit']");
    // TODO: Add a way to get the video download URL from the form itself
    const videoDownloadUrl = document.querySelector("#video-download-url")?.dataset.url;
    const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;

    let isEmpty = false;
    let lastFetchedData = null;
    let intervalTime = 1000;
    let intervalId = null;
    let isAwaitingResponse = false;
    let videoProcessingId = null;

    const toggleSpinner = (show) => {
        spinner.classList.toggle("show", show);
        form.querySelectorAll("input, button").forEach(el => el.toggleAttribute("disabled", show));
    };

    const getStatusBadge = (status) => {
        const badgeClasses = {
            "Baixado": "bg-success",
            "Pendente": "bg-warning text-dark",
            "Excluído": "bg-danger",
        };
        return `<span class="badge ${badgeClasses[status] || 'bg-secondary'}"><i class="bi bi-${status === 'Baixado' ? 'check-circle' : status === 'Pendente' ? 'hourglass-split' : 'trash'}"></i> ${status}</span>`;
    };

    const getDownloadTag = (status, filePath) => {
        if (status === "Baixado") {
            return `<a href="${filePath}" download class="btn btn-primary btn-sm">Download</a>`;
        }
        if (status === "Excluído") {
            return `<span class="text-danger">Expirado...</span>`;
        }
        return `<span class="text-muted">Aguardando...</span>`;
    };

    const getVideoDuration = (durationInSeconds) => {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const createTableRow = (video, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td><img class="img-thumb img-fluid rounded" src="${video.thumbnail_url}" alt="Thumbnail"></td>
            <td>
                <p>${video.title}</p>
                <p><strong>${video.uploader}</strong></p>
            </td>
            <td>
                <p><strong>Views:</strong> ${video.views}</p>
                <p><strong>Duração:</strong> ${getVideoDuration(video.duration_s)}</p>
            </td>
            <td><a href="${video.url}" target="_blank">${video.url}</a></td>
            <td>${getDownloadTag(video.status, video.file_path)}</td>
            <td>${getStatusBadge(video.status)}</td>
        `;
        return row;
    };

    const populateTable = (videos) => {
        const isDataIdentical = lastFetchedData && JSON.stringify(videos) === JSON.stringify(lastFetchedData);
        if (isDataIdentical) return;

        lastFetchedData = videos;
        videoTableBody.innerHTML = "";
        let hasPending = false;

        if (videos.length > 0) {
            videoTableContainer.classList.add("show");
            videos.forEach((video, index) => {
                if (video.status === "Pendente" && videoProcessingId === null) {
                    videoProcessingId = video.id;
                }

                if (["Pendente", "Baixado", "Excluído"].includes(video.status)) {
                    hasPending = true;
                }

                const row = createTableRow(video, index);
                videoTableBody.appendChild(row);
                setTimeout(() => row.classList.add("show"), 10);

                if (video.url.trim() === inputField.value.trim()) toggleSpinner(false);
            });

            intervalTime = hasPending && videoProcessingId !== null ? 1000 : 10000;
            isEmpty = false;
        } else {
            videoTableContainer.classList.remove("show");
            isEmpty = true;
        }

        clearInterval(intervalId);
        intervalId = setInterval(updateVideoTable, intervalTime);
    };

    const updateVideoTable = () => {
        if (isEmpty || isAwaitingResponse) return;

        fetch("/videos")
            .then(response => response.json())
            .then(data => {
                populateTable(data);
                if (!data.some(video => video.status === "Pendente") && videoProcessingId !== null) {
                    intervalTime = 10000;
                    clearInterval(intervalId);
                    intervalId = setInterval(updateVideoTable, intervalTime);
                    videoProcessingId = null;
                }
            })
            .catch(error => console.error("Erro ao buscar vídeos:", error));
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!inputField?.value) return alert("Por favor, insira uma URL válida.");

        toggleSpinner(true);
        isAwaitingResponse = true;
        intervalTime = 1000;
        clearInterval(intervalId);
        intervalId = setInterval(updateVideoTable, intervalTime);

        fetch(videoDownloadUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ video_url: inputField.value }),
        })
            .then(response => response.json())
            .then(() => {
                isEmpty = false;
                isAwaitingResponse = false;
                updateVideoTable();
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Ocorreu um erro ao tentar enviar a solicitação.");
                isAwaitingResponse = false;
            });
    };

    form?.addEventListener("submit", handleFormSubmit);
    intervalId = setInterval(updateVideoTable, intervalTime);
    updateVideoTable();
});
