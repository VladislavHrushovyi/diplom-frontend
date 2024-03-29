import { Button } from '@material-ui/core'
import { CloudUpload, Delete } from '@material-ui/icons'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { MapWithAMarker } from '../../Component/GoogleMap/GoogleMap'
import ComboBox from '../../Component/Select/Select'
import { useComboBoxField } from '../../hooks/selectHook'
import './PlaceManager.css'

export const PlaceManeger = (props) => {
    console.log(process.env.REACT_APP_API_GOOGLE)
    const districtsName = useComboBoxField('', 'DistrictsName')
    const placeName = useComboBoxField('', 'placeName')
    const [isDrawMap, setRedraw] = useState(true)
    const [isViewInfo, setInfoView] = useState({
        isView: false,
        marker: {
            districtName: "",
            typePlaceName: ""
        }
    })
    const [marker, setMarker] = useState({
        latitude: 49.44253,
        longitude: 32.06207
    })

    const [fetchMarkers, setFetchMarkers] = useState([]);


    useEffect(() => {
        axios.get("http://localhost:5000/api/place/get-places")
        .then(res => {
            setRedraw(false)
            console.log(res.data.value.places);
            setFetchMarkers(res.data.value.places)
            setRedraw(true)
            })
    }, [])

    const handlerClickMap = (t) => {
        const { latLng } = t;
        console.log(t);
        const lat = latLng.lat();
        const lng = latLng.lng();
        setMarker({
            ...marker,
            latitude: lat,
            longitude: lng
        })
    }

    const handleFormClick = (e) => {
        e.preventDefault();
        const data = {
            districtName: districtsName.value,
            typePlaceName: placeName.value,
            latitude: marker.latitude,
            longitude: marker.longitude
        }
        axios.post("http://localhost:5000/api/place/add-place", data)
        .then(() => {
            axios.get("http://localhost:5000/api/place/get-places")
                .then(res => {
                    setRedraw(false)
                    console.log(res.data.value.places);
                    setFetchMarkers(res.data.value.places)
                    setRedraw(true)
                })
        })
        console.log(data);
    }

    const handleClickPlacesByDistrict = (e) => {
        e.preventDefault();
        axios.get(`http://localhost:5000/api/place/${districtsName.value}/places`)
                .then(res => {
                    setRedraw(false)
                    console.log(res.data.value.items);
                    setFetchMarkers(res.data.value.items)
                    setRedraw(true)
                })
    }

    const handleDeletePlaceClick = () => {
        axios.delete(`http://localhost:5000/api/place/${isViewInfo.marker.id}/delete-place`)
        .then(res => {
            axios.get("http://localhost:5000/api/place/get-places")
                .then(res => {
                    setRedraw(false)
                    console.log(res.data.value.places);
                    setFetchMarkers(res.data.value.places)
                    setRedraw(true)
                })
        })
    }

    const map = (
        <MapWithAMarker
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_API_GOOGLE}&v=3.exp&libraries=geometry,drawing,places`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `400px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
                setMarker = {handlerClickMap}
                marker = {{lat:marker.latitude, lng:marker.longitude}}
                fetchMarker = {fetchMarkers}
                onClickMarker = {setInfoView}
            />
    )

    const markerInfo = (
        <>
        {console.log(isViewInfo)}
            <p>{"Район: "+isViewInfo.marker.districtName + " Тип місця: " + isViewInfo.marker.typePlaceName}
            <Button
                        variant="contained"
                        color="primary"
                        className="button-add-place"
                        startIcon={<Delete />}
                        onClick={handleDeletePlaceClick}
                        style={{marginLeft: 40}}
                    >
                        Видалити
                    </Button>
            </p>
        </>
    )

    return (
        <>
       {isDrawMap ? map : null}
       {isViewInfo.isView ? markerInfo : null}
            <form className="form" onSubmit={handleFormClick}>
                <h2 className="title">Форма додвання ключового місця</h2>
            <div className='button-container'>
                <ComboBox className='selector' set={districtsName} label="Назва району" required={true} fetch="districts"/>
                <ComboBox className='selector' set={placeName} label="Тип будівлі" required={true} fetch="type-places"/>
                <Button
                        variant="contained"
                        color="primary"
                        className="button-add-place"
                        type="submit"
                        startIcon={<CloudUpload />}
                    >
                        Добавти місце
                    </Button>
            </div>
            </form>
            <form className="form" onSubmit={handleClickPlacesByDistrict}>
                <h2 className="title">Показати місця по району</h2>
            <div className='button-container'>
                <ComboBox className='selector' set={districtsName} label="Назва району" required={true} fetch="districts"/>
                <Button
                        variant="contained"
                        color="primary"
                        className="button-add-place"
                        type="submit"
                        startIcon={<CloudUpload />}
                    >
                       Показати
                    </Button>
            </div>
            </form>

        </>
    )
}
  