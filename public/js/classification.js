document.addEventListener("DOMContentLoaded", () => {
  const heartIcons = document.querySelectorAll(".heart-icon");

  heartIcons.forEach((icon) => {
    icon.addEventListener("click", async () => {
      const invId = icon.dataset.invId;
      const isFavorited = icon.src.includes("heart_solid");

      try {
        const response = await fetch(`/account/favorites/${invId}`, {
          method: isFavorited ? "DELETE" : "POST",
        });

        if (response.ok) {
          icon.src = isFavorited ? "/images/site/heart_border.png" : "/images/site/heart_solid.png";
        } else {
          console.error("Failed to toggle favorite:", await response.text());
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    });
  });
});