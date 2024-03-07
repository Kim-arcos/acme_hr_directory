const pg = require("pg");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = "SELECT * FROM employees";
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = "SELECT * FROM departments ORDER By created_at DESC";
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
        INSERT INTO employees(name, department_id)
        VALUES($1, $2)
        RETURNING *;
    `;
    const { name, department_id } = req.body;
    const response = await client.query(SQL, [name, department_id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put("/api/employees/:id", async (req, res, next) => {
try {
  const SQL = `
    UPDATE employees
    SET name=$1, department_id=$2, updated_at=now()
    WHERE id = $3;
    `;
  const { name, department_id } = req.body;
  const response = await client.query(SQL, [name, department_id, req.params.id]);
  res.send(response.rows[0]);
} catch (error) {
  next(error);
}
});

app.delete("/api/employees/:id", async (req, res, next) => {
try {
  const SQL = `
  DELETE FROM employees
    WHERE id = $3;
    `;

  await client.query(SQL, [req.params.id]);
  res.sendStatus(204);
} catch (error) {
  next(error);
}
});

app.use((err, req, res, next) => {
  res.status(500).send({ error: err.message });
});

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_hr_directory_db"
);

async function init() {
  client.connect();

  const SQL = `
  DROP TABLE IF EXISTS employees;
  DROP TABLE IF EXISTS departments;
  
  CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
  );

  CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    department_id INTEGER REFERENCES departments(id) NOT NULL
   );

   INSERT INTO departments(name) VALUES('IT');
   INSERT INTO departments(name) VALUES('HR');
   
   INSERT INTO employees(name, department_id)
   VALUES('John Doe', (SELECT id FROM departments WHERE name = 'IT'));

   INSERT INTO employees(name, department_id)
   VALUES('Jane Smith', (SELECT id FROM departments WHERE name = 'HR'));
 `;

  await client.query(SQL);

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

init();
