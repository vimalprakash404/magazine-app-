import * as loader from "../assets/loader-anim.json";
import Lottie from "react-lottie";
import { LinearProgress } from "@mui/material";

function Loader({ progress }) {
    const bookLoadAnimations = {
        loop: true,
        autoplay: true,
        animationData: loader.default,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice" // Corrected typo here
        }
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
             <div >
             <Lottie options={bookLoadAnimations} height={"500px"} width={"500px"} isClickToPauseDisabled={true} />
             </div>
                
            <div style={{ width: "70%", margin: "auto" ,marginTop:0}}>
                <LinearProgress variant="determinate" value={progress} />
            </div>
        </div>
    );
}

export default Loader;
