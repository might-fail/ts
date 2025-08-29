import { mightFail, makeMightFail } from "../src/index"

async function fetchUser(id: number) {
  return Promise.resolve({
    id,
    name: "John Doe", 
    email: "john@example.com",
    posts: [
      { id: 1, title: "First Post", views: 100 },
      { id: 2, title: "Second Post", views: 250 }
    ]
  })
}

async function main() {
  console.log("=== Direct mightFail usage with .map ===")
  
  // Using mightFail directly with .map
  const { error: error1, result: titles } = await mightFail(fetchUser(123))
    .map(user => user.posts.map(post => post.title))
  
  if (error1) {
    console.error('Error:', error1.message)
    return
  }
  
  console.log('Post titles:', titles)
  
  // Chain multiple transformations with mightFail
  const { error: error2, result: summary } = await mightFail(fetchUser(456))
    .map(user => user.posts)
    .map(posts => posts.reduce((total, post) => total + post.views, 0))
    .map(totalViews => `User has ${totalViews} total views`)
  
  if (error2) {
    console.error('Error:', error2.message)
    return
  }
  
  console.log('Summary:', summary)
  
  console.log("\n=== makeMightFail usage with .map ===")
  
  // Using makeMightFail with .map
  const safeGetUser = makeMightFail(fetchUser)
  
  const { error: error3, result: userEmail } = await safeGetUser(789)
    .map(user => user.email.toUpperCase())
  
  if (error3) {
    console.error('Error:', error3.message)
    return
  }
  
  console.log('User email:', userEmail)
  
  // Error handling during transformation
  console.log("\n=== Error handling in .map ===")
  
  const { error: error4, result: result4 } = await mightFail(fetchUser(999))
    .map(() => {
      // Simulate an error during transformation
      throw new Error("Something went wrong during processing")
    })
  
  if (error4) {
    console.error('Caught transformation error:', error4.message)
  } else {
    console.log('Result:', result4)
  }
}

main()