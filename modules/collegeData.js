const Sequelize = require('sequelize');

var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'mGS9Yr8pCUaO', {
    host: 'ep-tiny-sea-a5tang5k.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    dialectModule: require('pg'),
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});
// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    course: Sequelize.INTEGER 
}, {
    tableName: 'students',
    timestamps: false
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
}, {
    tableName: 'courses',
    timestamps: false
});

// Define relationships
Course.hasMany(Student, { foreignKey: 'course' });
Student.belongsTo(Course, { foreignKey: 'course' });

module.exports = {
    sequelize,
    Student,
    Course
};
// Remove all code except the module.exports functions

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                console.log('Database synchronized');
                resolve();
            })
            .catch(err => {
                console.error('Unable to sync the database:', err);
                reject("unable to sync the database");
            });
    });
}

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(students => {
                if (students.length === 0) {
                    reject("no results returned");
                } else {
                    resolve(students);
                }
            })
            .catch(err => {
                console.error('Error fetching students:', err);
                reject("no results returned");
            });
    });
}
module.exports.getAllCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(courses => {
                if (courses.length === 0) {
                    reject("no results returned");
                } else {
                    resolve(courses);
                }
            })
            .catch(err => {
                console.error('Error fetching courses:', err);
                reject("no results returned");
            });
    });
}

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                studentNum: num
            }
        })
        .then(students => {
            if (students.length === 0) {
                reject("no results returned");
            } else {
                resolve(students[0]);  // Return the first result
            }
        })
        .catch(err => {
            console.error('Error fetching student by number:', err);
            reject("no results returned");
        });
    });
}

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findAll({
            where: { courseId: id }  // Filter by courseId
        })
        .then(courses => {
            if (courses.length === 0) {
                reject("no results returned");
            } else {
                resolve(courses[0]);  // Return the first course object
            }
        })
        .catch(err => {
            console.error('Error fetching course by ID:', err);
            reject("no results returned");
        });
    });
}


module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                course: course
            }
        })
        .then(students => {
            if (students.length === 0) {
                reject("no results returned");
            } else {
                resolve(students);
            }
        })
        .catch(err => {
            console.error('Error fetching students by course:', err);
            reject("no results returned");
        });
    });
}
module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Ensure TA property is set correctly
        studentData.TA = (studentData.TA) ? true : false;

        // Replace empty values with null
        for (let key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }

        // Create a new student record
        Student.create(studentData)
            .then(() => {
                resolve();  // Resolve promise on successful creation
            })
            .catch(err => {
                console.error('Error creating student:', err);
                reject("unable to create student");  // Reject promise on failure
            });
    });
}
// Update an existing student record
module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Ensure TA property is set correctly
        studentData.TA = (studentData.TA) ? true : false;
        // Replace empty values with null
        for (let key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }
        // Update student record in the database
        Student.update(studentData, {
            where: {
                studentNum: studentData.studentNum
            }
        })
        .then(() => {
                resolve();  // Resolve promise on successful update
            
        })
        .catch(err => {
            console.error('Error updating student:', err);
            reject("unable to update student");  // Reject promise on failure
        });
    });
}
module.exports.addCourse = function(courseData) {
    return new Promise((resolve, reject) => {
        // Ensure any blank values are set to null
        for (let key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }

        // Create a new course in the database
        Course.create(courseData)
            .then(() => {
                resolve();  // Operation successful
            })
            .catch(err => {
                console.error('Error creating course:', err);
                reject("unable to create course");  // Handle error
            });
    });
};

module.exports.deleteCourseById = function(courseId) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: {
                courseId: courseId
            }
        })
        .then((deletedRows) => {
            if (deletedRows > 0) {
                resolve("Course successfully deleted");
            } else {
                reject("Course not found");
            }
        })
        .catch((err) => {
            reject("Unable to delete course: " + err);
        });
    });
}


module.exports.deleteStudentByNum = function(studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: {
                studentNum: studentNum
            }
        })
        .then((deletedRows) => {
            if (deletedRows > 0) {
                resolve("Student successfully deleted");
            } else {
                reject("Student not found");
            }
        })
        .catch((err) => {
            reject("Unable to delete student: " + err);
        });
    });
}
module.exports.updateCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        // Replace empty values with null
        for (let key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }

        // Update course record in the database
        Course.update(courseData, {
            where: {
                courseId: courseData.courseId
            }
        })
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) {
                reject("Course not found");  // Reject if no rows were updated
            } else {
                resolve();  // Resolve promise on successful update
            }
        })
        .catch(err => {
            console.error('Error updating course:', err);
            reject("unable to update course");  // Reject promise on failure
        });
    });
}

/*module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(courses => {
                if (courses.length === 0) {
                    reject("no results returned");
                } else {
                    resolve(courses);  // Return all courses
                }
            })
            .catch(err => {
                console.error('Error fetching courses:', err);
                reject("no results returned");
            });
    });
}*/

