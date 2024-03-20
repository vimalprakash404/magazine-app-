import * as Error from "../assets/Error.json";
import Lottie from "react-lottie";

function ErrorAnim(){
    const option = {
        loop :  true,
        autoplay :  true , 
        animationData : Error.default ,
        rendererSettings : {
            preserverAspectRatio : "xMidYMid slice"
        } 
    }
    return (
        <>
        <Lottie options={option}  height={"200px"} width={"200px"} isClickToPauseDisabled={true}/>
        <h1>Failed to load</h1>
        </>
        
    )
}


export default ErrorAnim ;