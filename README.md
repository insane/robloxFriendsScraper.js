# Roblox Friends Scraper (Console Script)

This script allows you to fetch all friends of a given Roblox user directly from the browser console, including their **usernames**, **display names**, and **verified badge status**. The results are shown in a neat table, summarized, and also exported as a CSV (copied to your clipboard if possible).

## ⚡ How to Use

1. Open a browser and log in to your [Roblox account](https://www.roblox.com/).
2. Navigate to the users profile page
3. Open the **Developer Console**:
- Chrome / Edge: `F12` → Console tab  
- Firefox: `Ctrl+Shift+K`  
- Safari: `Cmd+Opt+C`
4. Copy the entire script from [`friends-scraper.js`](./friends-scraper.js) and paste it into the console.
5. Hit **Enter** to run.

## ✅ Output

- A preview table (`console.table`) of the first 20 friends  
- A `Summary` object in the console containing:
- `userId`: the target user  
- `totalFriends`: total count  
- `verifiedCount`: number of verified friends  
- `sample`: first 10 results  
- `all`: full friend list array  
- A CSV export:
- Automatically copied to your clipboard if allowed  
- If clipboard copy fails, it will be logged for manual copy  

## 📄 CSV Format

The CSV contains the following columns:

| id | username | displayName | hasVerifiedBadge |
|----|----------|-------------|------------------|
