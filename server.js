/******************************************************************************** * 
*  WEB700 – Assignment 06 
*  
*	I declare that this assignment is my own work in accordance with Seneca's *  Academic Integrity Policy: 
*  
*	https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*	Name: Nelapatla Lakshmi Apoorva Student ID: 151316239 Date: 10 August 2024
* 
*	Published URL: 
* 
********************************************************************************/ 
const express = require('express');
const exphbs = require('express-handlebars');
const collegeData = require('./modules/collegeData');
const data = require('./modules/collegeData.js');
const app = express();
const PORT = process.env.PORT || 8080;

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set up Handlebars
const handlebars = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            return lvalue != rvalue ? options.inverse(this) : options.fn(this);
        }
    }
});
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

// Middleware for active route
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Routes
app.get('/', (req, res) => res.render('home'));

app.get('/about', (req, res) => res.render('about'));

app.get('/htmlDemo', (req, res) => res.render('htmlDemo'));

// Route to display the form for adding a new course
app.get('/courses/add', (req, res) => res.render('addCourse'));
app.get('/students', (req, res) => {
    collegeData.getAllStudents()
        .then((data) => res.render('students', { students: data.length > 0 ? data : [], message: data.length > 0 ? "" : "No results found" }))
        .catch((err) => {
            console.error('Error fetching students:', err);
            res.render('students', { message: "Error fetching students" });
        });
});
app.get('/courses', (req, res) => {
    collegeData.getAllCourses()
        .then((data) => res.render('courses', { courses: data.length > 0 ? data : [], message: data.length > 0 ? "" : "No results found" }))
        .catch((err) => {
            console.error('Error fetching courses:', err);
            res.render('courses', { message: "An error occurred while retrieving courses." });
        });
});
app.get('/courses/:id', (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then((courseData) => {
            if (courseData === undefined) {
                res.status(404).send("Course Not Found");
            } else {
                res.render("course", { course: courseData });
            }
        })
        .catch((err) => {
            res.status(500).send("Unable to retrieve course: " + err);
        });
});
/*app.get('/student/:studentNum', (req, res) => {
    const studentNum = req.params.studentNum;
    
    collegeData.getStudentByNum(studentNum)
        .then(data => {
            // Render the student view and pass the student data
            res.render('student', { student: data });
        })
        .catch(err => {
            // Handle error (optional)
            res.status(404).send("Student not found");
        });
  });
  */
  app.get("/student/:studentNum", (req, res) => { 
 
    // initialize an empty object to store the values     
    let viewData = {}; 
 
    data.getStudentByNum(req.params.studentNum).then((data) => {         
        if (data) 
        { 
            viewData.student = data; //store student data in the "viewData" object as "student" 
        } 
        else { 
            viewData.student = null; // set student to null if none were returned 
        } 
    }).catch((err) => { 
        viewData.student = null; // set student to null if there was an error  
    }).then(data.getCourses) 
    .then((data) => { 
        viewData.courses = data; // store course data in the "viewData" object as "courses" 
 
        // loop through viewData.courses and once we have found the courseId that matches 
        // the student's "course" value, add a "selected" property to the matching          // viewData.courses object 
 
        for (let i = 0; i < viewData.courses.length; i++) { 
            if (viewData.courses[i].courseId == viewData.student.course) 
            {                 
                viewData.courses[i].selected = true;
            } 
        } 
 
    }).catch((err) => { 
        viewData.courses = []; // set courses to empty if there was an error 
    }).then(() => { 
        if (viewData.student == null) { // if no student - return an error             
            res.status(404).send("Student Not Found"); 
        } else { 
            res.render("student", { viewData: viewData }); // render the "student" view 
        } 
    }); 
}); 

// Render the form to add a new student
app.get('/students/add', (req, res) => {
    collegeData.getAllCourses()
        .then(courses => res.render('addStudent', { courses: courses }))
        .catch(err => {
            console.error("Error fetching courses:", err);
            res.render('addStudent', { courses: [] });
        });
});

// Route to delete a student by student number
app.get('/student/delete/:studentNum', (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => res.redirect('/students'))
        .catch((err) => res.status(500).send("Unable to Remove Student / Student not found"));
});

// Route to delete a course by course ID
app.get('/course/delete/:id', (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => res.redirect('/courses'))
        .catch((err) => res.status(500).send("Unable to Remove Course / Course not found"));
});

app.post('/students/update', (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => res.redirect('/students'))
        .catch(err => res.status(500).send("Error updating student: " + err));
});

app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => res.redirect('/courses'))
        .catch((error) => res.status(500).send('Unable to add course: ' + error));
});

app.post("/courses/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then((message) => res.redirect('/courses'))
        .catch((error) => res.status(500).send('Unable to update course: ' + error));
        
});

app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => res.redirect('/students'))
        .catch((err) => res.status(500).send("Error adding student: " + err));
});

// 404 Error Handler
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize and start the server
collegeData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Unable to start server: ", err);
    });
