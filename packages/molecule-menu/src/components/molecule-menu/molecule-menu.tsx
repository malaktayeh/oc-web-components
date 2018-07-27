import { Component, Prop, Event, EventEmitter } from '@stencil/core';

import { IVolumeOptions, IVisibilityOptions } from '@openchemistry/types';
import { composeVolumeOptions, composeVisibilityOptions } from '@openchemistry/utils';

// import { isNil } from "lodash-es";
import '@ionic/core';
import 'ionicons';
import '@openchemistry/volume-controls';

@Component({
  tag: 'oc-molecule-menu',
  styleUrl: 'molecule-menu.css',
  shadow: true
})
export class MoleculeMenu {

  @Prop() hasVolume: boolean = false;
  @Prop() nModes: number = -1;
  @Prop() volumeOptions: IVolumeOptions;
  @Prop() colorMaps: string[];
  @Prop({ mutable: true }) visibilityOptions: IVisibilityOptions;
  @Prop({ mutable: true }) isoValue: number = 0.01;
  @Prop({ mutable: true }) scaleValue: number = 1.0;
  @Prop({ mutable: true }) iMode: number = -1;
  @Prop({ mutable: true }) play: boolean = true;
  @Prop({ mutable: true }) activeMap: string = 'Viridis';

  @Event() isoValueChanged: EventEmitter;
  @Event() scaleValueChanged: EventEmitter;
  @Event() normalModeChanged: EventEmitter;
  @Event() playChanged: EventEmitter;
  @Event() opacitiesChanged: EventEmitter;
  @Event() visibilityChanged: EventEmitter;
  @Event() colorMapChanged: EventEmitter;

  componentWillLoad() {
    console.log('MoleculeMenu is about to be rendered');
  }

  componentDidLoad() {
    console.log('MoleculeMenu has been rendered');
  }

  componentWillUpdate() {
    console.log('MoleculeMenu will update and re-render');
  }

  componentDidUpdate() {
    console.log('MoleculeMenu did update');
  }

  componentDidUnload() {
    console.log('MoleculeMenu removed from the DOM');
  }

  isoValueHandler(val: number) {
    if (!isFinite(val) || val === this.isoValue) {
      return;
    }
    this.isoValue = val;
    this.isoValueChanged.emit(val);
  }

  scaleValueHandler(val: number) {
    if (!isFinite(val) || val === this.scaleValue) {
      return;
    }
    this.scaleValue = val;
    this.scaleValueChanged.emit(val);
  }

  normalModeHandler(valStr: string) {
    let val = parseInt(valStr);
    if (val === this.iMode) {
      return;
    }
    this.iMode =val;
    this.normalModeChanged.emit(val);
  }

  toggleVisibilityHandler(key: string, val: boolean) {
    this.visibilityOptions = {...this.visibilityOptions, ...{[key]: !val}};
    this.visibilityChanged.emit(this.visibilityOptions);
  }

  playHandler() {
    this.play = !this.play;
    this.playChanged.emit(this.play);
  }

  colorMapHandler(val: string) {
    if (val !== this.activeMap) {
      this.activeMap = val;
      this.colorMapChanged.emit(val);
    }
  }

  render() {
    const normalModeOptions = [];
    normalModeOptions.push(
      <ion-select-option key={'-1'} value={'-1'}>None</ion-select-option>
    );
    for (let i = 0; i < this.nModes; ++i) {
      normalModeOptions.push(
        <ion-select-option key={i.toString()} value={i.toString()}>{i}</ion-select-option>
      );
    }

    const colorMapsOptions = [];
    for (let mapName of this.colorMaps || []) {
      colorMapsOptions.push(
        <ion-select-option key={mapName} value={mapName}>{mapName}</ion-select-option>
      );
    }

    const volumeOptions = composeVolumeOptions(this.volumeOptions);
    const visibilityOptions = composeVisibilityOptions(this.visibilityOptions);

    if (!this.hasVolume && this.nModes <= 0) {
      return null;
    }

    let menuItems = [];
    if (this.hasVolume) {
      menuItems.push(
        <ion-item key="isoSurfaceToggle">
          <ion-label>Show Isosurface</ion-label>
          <ion-toggle
            checked={visibilityOptions.isoSurfaces}
            onIonChange={()=>{this.toggleVisibilityHandler('isoSurfaces', visibilityOptions.isoSurfaces)}}
          />
        </ion-item>
      );
      if (visibilityOptions.isoSurfaces) {
        menuItems.push(
          <ion-item key="isoSurfaceSlider">
            <ion-label color="primary" position="stacked">Isovalue</ion-label>
            <ion-range
              debounce={150}
              min={0.0005}
              max={0.05}
              step={0.0001}
              value={this.isoValue}
              onIonChange={ (e: CustomEvent)=>{this.isoValueHandler(e.detail.value)}}
            />
            <div class="end-slot" slot="end">
              <ion-input value={isFinite(this.isoValue) ? this.isoValue.toFixed(4) : "0.0000"}
                debounce={500}
                onIonChange={(e: CustomEvent)=>{this.isoValueHandler(parseFloat(e.detail.value))}}
              ></ion-input>
            </div>
          </ion-item>
        );
      }
      menuItems.push(
        <ion-item key="volumeToggle">
          <ion-label>Show Volume</ion-label>
          <ion-toggle
            checked={visibilityOptions.volume}
            onIonChange={()=>{this.toggleVisibilityHandler('volume', visibilityOptions.volume)}}
          />
        </ion-item>
      );
      if (visibilityOptions.volume) {
        menuItems.push(
          <div style={{width: "100%", height: "8rem"}}>
            <oc-volume-controls
              colors={volumeOptions.colors}
              colorsX={volumeOptions.colorsScalarValue}
              opacities={volumeOptions.opacity}
              opacitiesX={volumeOptions.opacityScalarValue}
              range={volumeOptions.range}
              histograms={volumeOptions.histograms}
              onOpacitiesChanged={(ev: CustomEvent) => {this.opacitiesChanged.emit(ev.detail);}}
            />
          </div>
        );
        menuItems.push(
            <ion-item key="colormapSelect">
              <ion-label color="primary" position="stacked">Color Map</ion-label>
              <ion-select
                style={{width: "100%"}}
                value={this.activeMap}
                onIonChange={(e: CustomEvent)=>{this.colorMapHandler(e.detail.value)}}
              >
                {colorMapsOptions}
              </ion-select>
            </ion-item>
        );
      }
    }

    if (this.nModes > 0) {
      menuItems.push(
        <ion-item key="normalModeSelect">
          <ion-label color="primary" position="stacked">Normal Mode</ion-label>
          <ion-select
            style={{width: "100%"}}
            value={this.iMode.toString()}
            onIonChange={(e: CustomEvent)=>{this.normalModeHandler(e.detail.value)}}
          >
            {normalModeOptions}
          </ion-select>
          <div class="end-slot" slot="end">
            <ion-button fill="solid" color="light" shape="round" onClick={() => {this.playHandler()}}>
              <ion-icon icon={this.play ? "pause" : "play"}></ion-icon>
            </ion-button>
          </div>
        </ion-item>
      );
      menuItems.push(
        <ion-item disabled={!this.play || this.iMode < 0} key="animationScaleSlider">
          <ion-label color="primary" position="stacked">Animation Scale</ion-label>
          <ion-range
            debounce={150}
            min={0.5}
            max={3}
            step={0.5}
            value={this.scaleValue}
            onIonChange={ (e: CustomEvent)=>{this.scaleValueHandler(e.detail.value)}}
          />
          <div class="end-slot" slot="end">
            <ion-input value={isFinite(this.scaleValue) ? this.scaleValue.toFixed(1) : "0.0"}
              debounce={500}
              onIonChange={(e: CustomEvent)=>{this.scaleValueHandler(parseFloat(e.detail.value))}}
            ></ion-input>
          </div>
        </ion-item>
      );
    }

    return (
      <div>
        {menuItems}
      </div>
    )
  }
}