import { makeMightFail } from "../src/makeMightFail"

async function fetchPosts() {
  return Promise.resolve({
    data: [
      { id: 1, title: "First Post", content: "Hello World" },
      { id: 2, title: "Second Post", content: "More content" }
    ]
  })
}

async function main() {
  const get = makeMightFail(fetchPosts)
  
  // Example from README - extracting titles
  const { error, result } = await get().map(response => 
    response.data.map(post => post.title)
  )

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log('Post titles:', result)
  
  // Chain multiple transformations
  const { error: error2, result: result2 } = await get()
    .map(response => response.data)
    .map(posts => posts.length)
    .map(count => `Found ${count} posts`)

  if (error2) {
    console.error('Error:', error2.message)
    return
  }

  console.log('Count message:', result2)
}

main()