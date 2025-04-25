import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import HTMLFlipBook from "react-pageflip";
import { pdfjs, Document, Page as ReactPdfPage } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./Test.css";
import "./menu.css";
import useIsMobile from "./useIsMobile";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faSearchPlus, faSearchMinus, faCircleArrowRight, faCircleArrowLeft  ,faExpand , faMinimize} from '@fortawesome/free-solid-svg-icons';
import Loader from "./Loader";
import "./sideButton.css"
import { isMobile as isMob, isTablet, isBrowser } from 'react-device-detect';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Page = React.forwardRef(({ pageNumber, width }, ref) => {
  return (
    <div ref={ref} className="page">
      <ReactPdfPage pageNumber={pageNumber} ref={ref} className={"page-content"} width={width} />
    </div>
  );
});



function Test({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageBuffer, setPageBuffer] = useState(4);
  const [sliderValue, setSliderValue] = useState(1);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const pageFlipRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = useIsMobile();
  const draggableRef = useRef(null);


  const [isFullScreen, setIsFullScreen] = useState(false);
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error('Error attempting to enable full-screen mode:', err.message);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch(err => {
        console.error('Error attempting to exit full-screen mode:', err.message);
      });
    }
  };
 /* 
  function to  toggle to full screen 
 
 */
  const incrementBuffer = () => {
    if (pageBuffer + 4 >= numPages) {
      setPageBuffer(numPages);
    } else {
      setPageBuffer(pageBuffer + 4);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setDocumentLoaded(true);
    setLoaderHider(true);
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
      pageFlipRef.current.pageFlip().flipNext();
      incrementBuffer();
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      pageFlipRef.current.pageFlip().flipPrev();
    }
  };

  const handleChangePage = (value) => {
    if (value >= 1 && value <= numPages) {
      setCurrentPage(value);
      setSliderValue(value);
      pageFlipRef.current.pageFlip().turnToPage(Number(value));
    }
  };
  
  const handleSliderChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setSliderValue(value);
    handleChangePage(value);
    if (value > pageBuffer){
      if(value+4 >= numPages){
        setPageBuffer(numPages);
      }
      else {
        setPageBuffer(value);
      }
    }
    
  };


  const handleSliderMouseMove = (event) => {
    const sliderRect = event.currentTarget.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    const sliderLeft = sliderRect.left;
    const sliderValue = parseInt(event.target.value, 10);
    const thumbPositionRatio = (sliderValue - 1) / (numPages - 1);

    const thumbPositionX = sliderLeft + thumbPositionRatio * sliderWidth;
    const tooltipLeft = thumbPositionX;

    setTooltipPosition({ left: tooltipLeft, top: 0, visible: true });
  };

  const handleSliderMouseLeave = () => {
    setTooltipPosition({ left: 0, top: 0, visible: false });
  };

  const onPageChange = () => {
    setCurrentPage(pageFlipRef.current.pageFlip().getCurrentPageIndex() + 1);
    setSliderValue(pageFlipRef.current.pageFlip().getCurrentPageIndex() + 1);
    incrementBuffer();
  };

  const zoomIn = () => {
    if (zoomLevel < 2) { // Limiting zoom to 200%
      setZoomLevel(zoomLevel + 0.1);
    }
  };

  const zoomOut = () => {
    if (zoomLevel > 0.2) { // Limiting zoom to 20%
      setZoomLevel(zoomLevel - 0.1);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `scale(${zoomLevel})`;
      containerRef.current.style.transformOrigin = "0 5"; // Ensure proper scaling origin
    }
  }, [zoomLevel]);
  const [loaderHider, setLoaderHider] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const onProgress = (data) => {
    console.log("progress", data["loaded"] / data["total"]);
    setProgressValue(data["loaded"] / data["total"] * 100);
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      const distance = 15; // Adjust the distance to move on each key press

      if (!draggableRef.current) return;

      const { x, y } = draggableRef.current.state;

      switch (key) {
        case 'ArrowUp':
          draggableRef.current.setState({ y: y - distance });
          break;
        case 'ArrowDown':
          draggableRef.current.setState({ y: y + distance });
          break;
        case 'ArrowLeft':
          draggableRef.current.setState({ x: x - distance });
          break;
        case 'ArrowRight':
          draggableRef.current.setState({ x: x + distance });
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const handleClick = () => {
    setToolBarHider(true);
  }
  const [toolbarHider, setToolBarHider] = useState(false)

  const width = isBrowser ? 600 : isTablet  ? 500 : isMob ? 350 : 600 ;
  const hight =    isBrowser ? 800 : isTablet  ? 500 : isMob ? 500 : 700 ;
  return (
    <div className={isMobile ? "" : "test-container"}>

      <div className={isMobile ? "" : "centered-container"}>
        {loaderHider === false && <Loader progress={progressValue} />}
        <Document file={url} onLoadProgress={onProgress} onLoadSuccess={onDocumentLoadSuccess} className={isMobile ? "" : "center-document"} onClick={handleClick}>
          {documentLoaded && (
            <Draggable ref={draggableRef} onClick={handleClick}>
              <div>
                <div ref={containerRef} className="container">
                  <HTMLFlipBook
                    width={numPages === 1 ? width / 2 : width} // if numPage is 1 set width to width/2
                    height={hight}
                    maxShadowOpacity={0.2}
                    showCover={true}
                    className="book"
                    ref={pageFlipRef}
                    autoSize={false}
                    minWidth={100}
                    minHeight={100}
                    onFlip={onPageChange}
                    useMouseEvents={false}
                    renderOnlyPageLengthChange={false}
                  >
                    {numPages &&
                      Array.from(Array(numPages), (e, i) => {
                        const pageNum = i + 1;
                        return <Page key={pageNum} pageNumber={pageNum} width={width} />;
                      })}
                  </HTMLFlipBook>
                </div>
              </div>
            </Draggable>
          )}
        </Document>
      </div>
      {loaderHider === true && (
        <>
          <div className={`tool-bar ${toolbarHider === true && "tool-bar-hidden"}`} >
            <div className="menuSlider">
              <input
                type="range"
                min={1}
                max={numPages}
                value={sliderValue}
                onChange={handleSliderChange}
                onMouseUp={handleSliderChange}
                onTouchEnd={handleSliderChange}
                onMouseMove={handleSliderMouseMove}
                onTouchMove={handleSliderMouseMove}
                onMouseLeave={handleSliderMouseLeave}
                onTouchCancel={handleSliderMouseLeave}
                style={{ width: "70%" }}
                className="slider"
              />

              {tooltipPosition.visible && (
                <div className="slider-tooltip" style={{ left: tooltipPosition.left, top: tooltipPosition.top }}>
                  {sliderValue}

                </div>
              )}

            </div>
            <div className="menuData" >
              <div className="page-count">
                <span style={{ fontWeight: "bold" }}>{currentPage}</span> / <span>{numPages}</span>
              </div>

              <button className="btn btn-primary" onClick={goToPreviousPage} disabled={currentPage === 1}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>


              <button className="btn btn-primary" onClick={goToNextPage} disabled={currentPage === numPages}>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <div></div>

              <button className="btn btn-primary" onClick={zoomIn} disabled={zoomLevel === 2 ? true : false}>
                <FontAwesomeIcon icon={faSearchPlus} />
              </button>
              <button className="btn btn-primary" onClick={zoomOut} disabled={zoomLevel === 1 ? true : false} >
                <FontAwesomeIcon icon={faSearchMinus} />
              </button>
              <div className={isFullScreen ? 'full-screen' : ''}>
                <button onClick={toggleFullScreen}>
                  {isFullScreen ? <FontAwesomeIcon icon={faMinimize}/> :<FontAwesomeIcon icon={faExpand}/>}
                </button>
                {/* Your content goes here */}
              </div>
            </div>
          </div>
          <div>
            <div className="side-button side-button-left" onClick={goToPreviousPage} >
              <FontAwesomeIcon className="sideButtonIcon" icon={faCircleArrowLeft} />
            </div>
            <div className="side-button side-button-right" onClick={goToNextPage} >
              <FontAwesomeIcon className="sideButtonIcon" icon={faCircleArrowRight} />
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default Test;