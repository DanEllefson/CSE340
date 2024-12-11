document.addEventListener("DOMContentLoaded", () => {
  const heartIcons = document.querySelectorAll(".heart-icon");

  heartIcons.forEach(icon => {
    icon.addEventListener("click", async (event) => {
      const heartIcon = event.target;
      const invId = heartIcon.dataset.invId;
      const isFavorited = heartIcon.src.includes("heart_solid.png");

      try {
        if (isFavorited) {
          // Remove from favorites
          await fetch(`/account/favorites/${invId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            }
          });
          heartIcon.src = "/images/site/heart_border.png";
        } else {
          // Add to favorites
          await fetch(`/account/favorites/${invId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            }
          });
          heartIcon.src = "/images/site/heart_solid.png";
        }
      } catch (error) {
        console.error("Error updating favorite status:", error);
      }
    });
  });
});