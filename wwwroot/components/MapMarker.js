import { createPortal } from "/web_modules/preact/compat.js"

import Image from "/components/Image.js"
import {
  Fragment,
  connect,
  createSelector,
  html,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "/utils/h.js"
import { mapContext } from "/utils/map.js"
import { focusedPhotoIdSelector } from "/utils/store.js"

const photoIdSelector = (_, { photo: { id } }) => id

const withMarker = connect(
  createSelector(
    focusedPhotoIdSelector,
    photoIdSelector,
    (focusedPhotoId, photoId) => ({ focused: focusedPhotoId === photoId }),
  ),
)

function Marker({ focused, photo: { blob, gps } }) {
  const map = useContext(mapContext)
  const content = useMemo(() => document.createElement("div"), [])
  const popupRef = useRef()
  const markerRef = useRef()
  useEffect(() => {
    popupRef.current = new mapboxgl.Popup().setHTML(content)
    markerRef.current = new mapboxgl.Marker()
      .setLngLat(gps)
      .setPopup(popupRef.current)
      .addTo(map)
    popupRef.current.on("open")
    return () => {
      markerRef.current.remove()
    }
  }, [gps])
  // useEffect(() => {
  //   if (focused !== popupRef.current.isOpen()) {
  //     markerRef.current.togglePopup()
  //   }
  // }, [focused])

  return createPortal(
    html`
      <${Fragment}>
        <${Image} blob=${blob} />
      <//>
    `,
    content,
  )
}

export default withMarker(Marker)
