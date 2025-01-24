document.addEventListener("DOMContentLoaded", () => {
    const spinner = document.querySelector("#loading-spinner");
    const form = document.querySelector("#video-form");
    const inputField = form?.querySelector("input[name='video_url']");
    const submitButton = form?.querySelector("button[type='submit']");
    const videoQueue = document.querySelector("#video-queue");
    const videoDownloadUrl = "/videos/download";

    const toggleSpinner = (show) => {
        spinner.classList.toggle("show", show);
        form.querySelectorAll("input, button").forEach(el => el.toggleAttribute("disabled", show));
    };


    const showVideoQueuedCard = (videoInfo) => {
        const card = document.createElement("div");
        card.classList.add("video-card");

        card.innerHTML = `
            <img src="${videoInfo.thumbnail_url}" alt="Thumbnail do vídeo">
            <div>
                <p class="video-card-title">${videoInfo.title}</p>
                <p class="text-muted">Adicionado à fila de processamento.</p>
            </div>
            <div class="progress-bar"></div>
        `;

        const progressBar = card.querySelector(".progress-bar");
        videoQueue.prepend(card);

        const duration = 10000;
        const interval = 100;
        let elapsed = 0;

        const progressInterval = setInterval(() => {
            elapsed += interval;
            const progress = 100 - (elapsed / duration) * 100;
            progressBar.style.width = `${progress}%`;

            if (elapsed >= duration) {
                clearInterval(progressInterval);
                card.remove();
            }
        }, interval);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!inputField?.value) return alert("Por favor, insira uma URL válida.");

        toggleSpinner(true);

        fetch(videoDownloadUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ video_url: inputField.value }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Resposta:", data);
                toggleSpinner(false);

                if (data.success && data.video_info) {
                    showVideoQueuedCard(data.video_info);
                } else {
                    alert("Não foi possível adicionar o vídeo à fila.");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Ocorreu um erro ao tentar enviar a solicitação.");
                toggleSpinner(false);
            });
    };

    form?.addEventListener("submit", handleFormSubmit);
});