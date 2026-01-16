# PrimeReact DataTable – Custom Row Selection

This project demonstrates a custom row selection mechanism in **PrimeReact DataTable** when pagination and lazy loading are enabled.

I built this while exploring how PrimeReact handles row selection across pages and realized that the default selection behavior does not work well when data is loaded page by page. This project is my attempt to solve that problem in a clean and scalable way.

---

## 🚀 Features

- Select rows using checkboxes
- Custom option to **select the first N rows** from the dataset
- Selection state remains consistent while navigating between pages
- Works with **lazy-loaded pagination**
- Built using **React + TypeScript + PrimeReact**

---

## 🛠️ Approach

Instead of relying solely on PrimeReact’s internal selection handling, I maintain a separate selection state:

- Track selected row IDs manually
- Recalculate visible selections whenever:
  - Page changes
  - Data is fetched
  - Selection state updates
- Sync the calculated selection back to the DataTable

This approach keeps the logic predictable and avoids loading unnecessary data.

---

## 🧪 Data Source

Art Institute of Chicago Public API  
https://api.artic.edu/docs/

---

## 🧰 Tech Stack

- React
- TypeScript
- PrimeReact
- PrimeIcons

---

## 👤 Author

**Sandarbh Lakhera**
