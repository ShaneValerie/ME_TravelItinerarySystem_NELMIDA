const express = require('express')
const fs = require('fs')
const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.static(__dirname))

const activities = require("./data.json");

function saveActivities(){
    fs.writeFileSync(__dirname + "/data.json", JSON.stringify(activities, null, 4));
}

// sort by date, then by start time
function sortActivities(list) {
    return list.slice().sort((a, b) =>{
        if (a.date !== b.date){
            return a.date.localeCompare(b.date)
        }
        return a.start_time.localeCompare(b.start_time)
    });
}

app.get("/api/activities", (req, res) =>{
    res.json(sortActivities(activities));
});

app.get("/api/activities/:id", (req, res) =>{
    const id = Number(req.params.id);

    const activity = activities.find(activity => activity.id === id);

    if (!activity){
        return res.status(404).json({
            message: "Activity not found"
        });
    }
    res.json(activity);
});

let nextID = 1
activities.forEach(activity =>{
    if (activity.id >= nextID){
        nextID = activity.id + 1
    }
});

app.post("/api/activities", (req, res) =>{
    const body = req.body || {};
    const activity = String(body.activity || "").trim();
    const location = String(body.location || "").trim();
    const date = String(body.date || "").trim();
    const start_time = String(body.start_time || "").trim();
    const category = String(body.category || "").trim();

    if (!activity || !location || !date || !start_time || !category) {
        return res.status(400).json({
            message: "activity, location, date, start time, and category are required"
        });
    }

// reject if same date and start time already exists
    const conflict = activities.find(a => a.date === date && a.start_time === start_time);

    if (conflict){
        return res.status(409).json({
            message: "Another activity already exists on that date and start time"
        });
    }

    const newActivity ={
        id: nextID++,
        activity: activity,
        location: location,
        date: date,
        start_time: start_time,
        category: category
    }

    activities.push(newActivity)
    saveActivities()

    res.status(201).json(newActivity)
});

app.delete("/api/activities/:id", (req, res) =>{
    const id = Number(req.params.id);

    const index = activities.findIndex(activity => activity.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Activity not found"
        });
    }

    activities.splice(index, 1)
    saveActivities()

    res.json({
        message: "Activity deleted"
    });
});

app.listen(PORT, () =>{
    console.log(`Server running at http://localhost:${PORT}`)
});






























