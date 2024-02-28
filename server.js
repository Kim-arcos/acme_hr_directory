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

app.post("/api/routes", async (req, res, next) => {
  try {
    const SQL = `
        INSERT INTO routes(txt, employee_id)
        VALUES($1, $2)
        RETURNING *;
    `;
    const { text, employee_id } = req.body;
    const response = await client.query(SQL, [text, category]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put("/api/routes/:id", async (req, res, next) => {});
try {
  const SQL = `
    UPDATE notes
    SET text=$1, ranking=$2, employee_id=$3, updated_at=now()
    WHERE id = $4;
    `;
  const { text, ranking, employee_id } = req.body;
  const response = await client.query(SQL, [
    text,
    ranking,
    category_id,
    req.params.id,
  ]);
  res.send(response.rows)[0];
} catch (error) {
  next(error);
}

app.delete("/api/routes/:id", async (req, res, next) => {});
try {
  const SQL = `
  DELETE FROM employee
    WHERE id = $3;
    `;

  await client.query(SQL, [req.params.id]);
  res.sendStatus(204);
} catch (error) {
  next(error);
}

app.use((err, req, res, next) => {
  res.status(500).send({ error: err.message });
});

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_hr_directory_"
);

async function init() {
  client.connect();

  const SQL = `
  DROP TABLE IF EXISTS notes;
  DROP TABLE IF EXISTS categories;

  CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
  );

  CREATE TABLE notes(
    id SERIAL PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    department_id INTEGER REFERENCES department(id) NOT NULL
   );

   INSERT INTO employees(name) VALUES('Id);
   INSERT INTO employees(name) VALUES('Department');
   
   INSERT INTO notes(txt, employee_id)
   VALUES('Employee name', (SELECT if FROM categories WHERE name = 'Work'))

   INSERT INTO notes(txt, employee_id)
   VALUES('Department', (SELECT if FROM categories WHERE name = 'Department'))
 `;

  await client.query(SQL);

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

init();
