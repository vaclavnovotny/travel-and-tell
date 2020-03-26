import * as R from "/web_modules/ramda.js"
import {
  connect,
  createStructuredSelector,
  html,
  useCallback,
  useEffect,
  useRef,
} from "/utils/h.js"
import { createMap, mapContext } from "/utils/map.js"
import { photosByDateSelector, setFocusedPhotoId } from "/utils/store.js"
import MapMarker from "./MapMarker.js"

const withMap = connect(
  createStructuredSelector({ photos: photosByDateSelector }),
  {
    clearFocusedPhoto: setFocusedPhotoId(null),
  },
)

function Map({ clearFocusedPhoto, photos }) {
  const mapRef = useRef()

  const initMap = useCallback(node => {
    const map = createMap(node)
    mapRef.current = map

    map.on("popupclose", clearFocusedPhoto)
    map.on("load", () => {
      // needed otherwise map canvas dont expand
      window.dispatchEvent(new Event("resize"))
    })
  }, [])

  // useEffect(() => {
  //   if (!R.isEmpty(photos)) {
  //     const map = mapRef.current
  //     const polyline = L.polyline(photos.map(R.prop("gps")), {
  //       color: "red",
  //     }).addTo(map)
  //     map.fitBounds(polyline.getBounds())
  //   }
  // }, [photos])

  return html`
    <${mapContext.Provider} value=${mapRef.current}>
      <div className="absolute inset-0" ref=${initMap}>
        ${photos.map(
          photo =>
            html`
              <${MapMarker} key=${photo.id} photo=${photo} />
            `,
        )}
      </div>
    <//>
  `
}

export default withMap(Map)
