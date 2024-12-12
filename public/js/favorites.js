document.addEventListener("DOMContentLoaded", () => {
  const heartIcons = document.querySelectorAll(".heart-icon");

  heartIcons.forEach(icon => {
    icon.addEventListener("click", async (event) => {
      event.preventDefault();
      const heartIcon = event.target;
      const invId = icon.dataset.id;
      const isFavorited = heartIcon.src.includes("heart_solid.png");

      try {
        if (isFavorited) {
          // Remove from favorites
          const response = await fetch(`/account/favorites/${invId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invId: invId }),
          });

          if (!response.ok) {
            throw new Error("Failed to remove vehicle from favorite table");
          }
          
          location.reload();
          const result = await response.json();
          console.log(result.message);

          heartIcon.src = "/images/site/heart_border.png";
        } else {
          console.log("Error: heart icon is not solid in favorites view");
        }
      } catch (error) {
        console.error("Error updating favorite status:", error);
      }
    });
  });
});