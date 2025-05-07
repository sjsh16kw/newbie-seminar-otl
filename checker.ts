import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import lodash from 'lodash'


const prisma = new PrismaClient()




function problem1() {
  return prisma.$queryRaw`select firstName, lastName, income from Customer where income <= 60000 and income >= 50000 order by income desc, lastName asc, firstName asc LIMIT 10;`
}

function problem2() {
  return prisma.$queryRaw`
    SELECT 
      E.sin, 
      B.branchName, 
      E.salary, 
      CAST((M.salary - E.salary) AS CHAR) AS \`Salary Diff\`
    FROM Employee E
    JOIN Branch B ON E.branchNumber = B.branchNumber
    LEFT JOIN Employee M ON B.managerSIN = M.sin
    WHERE B.branchName IN ('London', 'Berlin')
    ORDER BY CAST((M.salary - E.salary) AS SIGNED) DESC
    LIMIT 10;
  `;
}


function problem3() {
  return prisma.$queryRaw`
    SELECT firstName, lastName, income
    FROM Customer
    WHERE income >= ALL (
      SELECT income * 2
      FROM Customer
      WHERE lastName = 'Butler'
    )
    ORDER BY lastName ASC, firstName ASC
    LIMIT 10;
  `
}

function problem4() {
  return prisma.$queryRaw`
    SELECT DISTINCT C.customerID, C.income, O.accNumber, A.branchNumber
    FROM Customer C
    JOIN Owns O ON C.customerID = O.customerID
    JOIN Account A ON O.accNumber = A.accNumber
    WHERE C.income > 80000
      AND C.customerID IN (
        SELECT customerID
        FROM Owns O1
        JOIN Account A1 ON O1.accNumber = A1.accNumber
        JOIN Branch B1 ON A1.branchNumber = B1.branchNumber
        WHERE B1.branchName = 'London'
      )
      AND C.customerID IN (
        SELECT customerID
        FROM Owns O2
        JOIN Account A2 ON O2.accNumber = A2.accNumber
        JOIN Branch B2 ON A2.branchNumber = B2.branchNumber
        WHERE B2.branchName = 'Latveria'
      )
    ORDER BY C.customerID ASC, O.accNumber ASC
    LIMIT 10;
  `
}

function problem5() {
  return prisma.$queryRaw`
    SELECT DISTINCT C.customerID, A.type, A.accNumber, A.balance
    FROM Customer C
    JOIN Owns O ON C.customerID = O.customerID
    JOIN Account A ON O.accNumber = A.accNumber
    WHERE A.type IN ('BUS', 'SAV')
      AND C.customerID IN (
        SELECT customerID
        FROM Owns O2
        JOIN Account A2 ON O2.accNumber = A2.accNumber
        WHERE A2.type IN ('BUS', 'SAV')
      )
    ORDER BY C.customerID ASC, A.type ASC, A.accNumber ASC
    LIMIT 10;
  `
}

function problem6() {
  return prisma.$queryRaw`
    SELECT B.branchName, A.accNumber, A.balance
    FROM Branch B
    JOIN Account A ON B.branchNumber = A.branchNumber
    WHERE B.managerSIN = (
      SELECT sin FROM Employee WHERE firstName = 'Phillip' AND lastName = 'Edwards'
    )
      AND A.balance > 100000
    ORDER BY A.accNumber ASC
    LIMIT 10;
  `
}
function problem7() {
  return prisma.$queryRaw`
    SELECT DISTINCT O.customerID
    FROM Owns O
    JOIN Account A ON O.accNumber = A.accNumber
    JOIN Branch B ON A.branchNumber = B.branchNumber
    WHERE B.branchName = 'New York'
      AND O.customerID NOT IN (
        SELECT O1.customerID
        FROM Owns O1
        JOIN Owns O2 ON O1.accNumber = O2.accNumber
        WHERE O2.customerID IN (
          SELECT O3.customerID
          FROM Owns O3
          JOIN Account A ON O3.accNumber = A.accNumber
          JOIN Branch B ON A.branchNumber = B.branchNumber
          WHERE B.branchName = 'London'
        )
      )
    ORDER BY O.customerID ASC
    LIMIT 10;
  `;
}

function problem8() {
  return prisma.$queryRaw`
    SELECT E.sin, E.firstName, E.lastName, E.salary, B.branchName
    FROM Employee E
    LEFT JOIN Branch B ON E.sin = B.managerSIN
    WHERE E.salary > 50000
    ORDER BY B.branchName DESC, E.firstName ASC
    LIMIT 10;
  `
}

function problem9() {
  return prisma.$queryRaw`
    SELECT E.sin, E.firstName, E.lastName, E.salary,
      (SELECT branchName FROM Branch B WHERE B.managerSIN = E.sin) AS branchName
    FROM Employee E
    WHERE E.salary > 50000
    ORDER BY branchName DESC, E.firstName ASC
    LIMIT 10;
  `
}

function problem10() {
  return prisma.$queryRaw`
    SELECT DISTINCT C.customerID, C.firstName, C.lastName, C.income
    FROM Customer C
    WHERE C.income > 5000
      AND NOT EXISTS (
        SELECT B1.branchNumber
        FROM Owns O1
        JOIN Account A1 ON O1.accNumber = A1.accNumber
        JOIN Branch B1 ON A1.branchNumber = B1.branchNumber
        WHERE O1.customerID = (
          SELECT customerID FROM Customer WHERE firstName = 'Helen' AND lastName = 'Morgan'
        )
        AND B1.branchNumber NOT IN (
          SELECT B2.branchNumber
          FROM Owns O2
          JOIN Account A2 ON O2.accNumber = A2.accNumber
          JOIN Branch B2 ON A2.branchNumber = B2.branchNumber
          WHERE O2.customerID = C.customerID
        )
      )
    ORDER BY C.income DESC
    LIMIT 10;
  `
}

function problem11() {
  return prisma.$queryRaw`
    SELECT E.sin, E.firstName, E.lastName, E.salary
    FROM Employee E
    JOIN Branch B ON E.branchNumber = B.branchNumber
    WHERE B.branchName = 'Berlin'
      AND E.salary = (
        SELECT MIN(E2.salary)
        FROM Employee E2
        JOIN Branch B2 ON E2.branchNumber = B2.branchNumber
        WHERE B2.branchName = 'Berlin'
      )
    ORDER BY E.sin ASC
    LIMIT 10;
  `
}

function problem14() {
  return prisma.$queryRaw`
    SELECT CAST(SUM(E.salary) AS CHAR) AS \`sum of employees salaries\`
    FROM Employee E
    JOIN Branch B ON E.branchNumber = B.branchNumber
    WHERE B.branchName = 'Moscow';
  `;
}

function problem15() {
  return prisma.$queryRaw`
    SELECT C.customerID, C.firstName, C.lastName
    FROM Customer C
    WHERE C.customerID IN (
      SELECT O.customerID
      FROM Owns O
      JOIN Account A ON O.accNumber = A.accNumber
      JOIN Branch B ON A.branchNumber = B.branchNumber
      GROUP BY O.customerID
      HAVING COUNT(DISTINCT B.branchName) = 4
    )
    ORDER BY C.lastName ASC, C.firstName ASC
    LIMIT 10;
  `
}

function problem17() {
  return prisma.$queryRaw`
    SELECT
      C.customerID,
      C.firstName,
      C.lastName,
      C.income,
      AVG(A.balance) AS \`average account balance\`
    FROM Customer C
    JOIN Owns O ON C.customerID = O.customerID
    JOIN Account A ON O.accNumber = A.accNumber
    WHERE C.lastName LIKE 'S%' AND C.lastName LIKE '%e%'
    GROUP BY C.customerID, C.firstName, C.lastName, C.income
    HAVING COUNT(DISTINCT A.accNumber) >= 3
    ORDER BY C.customerID ASC
    LIMIT 10;
  `;
}


function problem18() {
  return prisma.$queryRaw`
    SELECT 
      A.accNumber, 
      MAX(A.balance) AS balance, 
      SUM(T.amount) AS \`sum of transaction amounts\`
    FROM Account A
    JOIN Transactions T ON A.accNumber = T.accNumber
    JOIN Branch B ON A.branchNumber = B.branchNumber
    WHERE B.branchName = 'Berlin'
    GROUP BY A.accNumber
    HAVING COUNT(T.transNumber) >= 10
    ORDER BY \`sum of transaction amounts\` ASC
    LIMIT 10;
  `;
}


const ProblemList = [
  problem1, problem2, problem3, problem4, problem5, problem6, problem7, problem8, problem9, problem10,
  problem11, problem14, problem15, problem17, problem18
]

async function main() {
  for (let i = 0; i < ProblemList.length; i++) {
    const result = await ProblemList[i]();
    const answer = JSON.parse(fs.readFileSync(`${ProblemList[i].name}.json`, 'utf-8'));
    if (lodash.isEqual(result, answer)) {
      console.log(`${ProblemList[i].name}: Correct`);
    } else {
      console.log(`${ProblemList[i].name}: Incorrect`);
      //console.log(`Expected: ${JSON.stringify(answer, null, 2)}`);
      //console.log(`Actual: ${JSON.stringify(result, null, 2)}`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
