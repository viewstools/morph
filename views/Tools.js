// placeholder for the file that Views Tools writes when running the app
import { useEffect } from 'react'

export default function ViewsTools(props) {
  useEffect(() => {
    console.log(`



    😱😱😱😱😱😱😱😱😱😱😱



    🚨 You're missing out!!!

    🚀 Views Tools can help you find product market fit before you run out of money.

    ✨ Find out how 👉 https://views.tools




    `)
  }, [])

  return props.children
}
