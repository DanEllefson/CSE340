window.toggleFavorite = async function (event, invId, isFavorited) {
  event.preventDefault();

  try {
    // Determine the API endpoint and HTTP method
    const url = isFavorited
      ? `/account/favorites/${invId}`
      : `/account/favorites/${invId}`;
    const method = isFavorited ? "DELETE" : "POST";

    // Send request to server
    const response = await fetch(url, { method });

    if (response.ok) {
      // Toggle the heart icon state
      const heartIcon = event.target;
      if (isFavorited) {
        heartIcon.src = "/images/site/heart_border.png";
        heartIcon.alt = "Add to favorites";
        heartIcon.setAttribute("onclick", `toggleFavorite(event, ${invId}, false)`);
      } else {
        heartIcon.src = "/images/site/heart_solid.png";
        heartIcon.alt = "Remove from favorites";
        heartIcon.setAttribute("onclick", `toggleFavorite(event, ${invId}, true)`);
      }
    } else {
      console.error("Failed to toggle favorite status:", await response.text());
    }
  } catch (error) {
    console.error("Error toggling favorite status:", error);
  }
}

// Add event listener to all heart icons
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".heart-icon").forEach((icon) => {
    icon.addEventListener("click", async (event) => {
      const invId = event.target.dataset.id;
      const isFavorited = event.target.src.includes("heart_solid.png");

      console.log("Inventory ID (invId):", invId); // Log the invId
      console.log("Is Favorited:", isFavorited);

      if (!invId) {
        console.error("Inventory ID is missing");
        return;
      }

      const url = isFavorited ? "/account/favorites/delete" : "/account/favorites/add";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inv_id: invId }),
        });

        console.log("Fetch Response:", response);

        if (response.ok) {
          // Toggle the heart icon
          event.target.src = isFavorited
            ? "/images/site/heart_border.png"
            : "/images/site/heart_solid.png";
        } else {
          console.error("Error toggling favorite");
        }
      } catch (error) {
        console.error("Error in fetch:", error);
      }
    });
  });
});