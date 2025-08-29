import { mightFail } from "../src/index"

// Simulate API calls
function getProject(id: string) {
  return Promise.resolve({
    project: { id, name: "My Project", status: "active" }
  })
}

function getProjectPositions(_id: string) {
  return Promise.resolve({
    positions: [
      { id: 1, title: "Frontend Developer", department: "Engineering" },
      { id: 2, title: "Backend Developer", department: "Engineering" },
      { id: 3, title: "Product Manager", department: "Product" }
    ]
  })
}

async function main() {
  const projectId = "project-123"
  
  console.log("=== Using Promise.all with mightFail and .map ===")
  
  // Original approach - manually wrapping Promise.all
  const { error: error1, result: result1 } = await mightFail(
    Promise.all([getProject(projectId), getProjectPositions(projectId)])
  ).map(([projectData, positionsData]) => ({
    ...projectData.project,
    positions: positionsData.positions
  }))

  if (error1) {
    console.error('Error:', error1.message)
    return
  }

  console.log('Result with Promise.all:', result1)
  
  console.log("\n=== Using mightFail.all with .map ===")
  
  // New approach - using mightFail.all directly
  const { error: error2, result: result2 } = await mightFail.all([
    getProject(projectId), 
    getProjectPositions(projectId)
  ]).map(([projectData, positionsData]) => ({
    ...projectData.project,
    positions: positionsData.positions
  }))

  if (error2) {
    console.error('Error:', error2.message)
    return
  }

  console.log('Result with mightFail.all:', result2)
  
  console.log("\n=== Chaining multiple transformations ===")
  
  // Chain multiple transformations
  const { error: error3, result: result3 } = await mightFail.all([
    getProject(projectId), 
    getProjectPositions(projectId)
  ])
  .map(([projectData, positionsData]) => ({
    project: projectData.project,
    positions: positionsData.positions
  }))
  .map(data => ({
    ...data,
    totalPositions: data.positions.length,
    departments: [...new Set(data.positions.map(p => p.department))]
  }))
  .map(data => ({
    ...data,
    summary: `${data.project.name} has ${data.totalPositions} positions across ${data.departments.length} departments`
  }))

  if (error3) {
    console.error('Error:', error3.message)
    return
  }

  console.log('Chained result:', result3)
}

main()