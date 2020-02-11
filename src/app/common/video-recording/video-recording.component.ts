import {Component, ElementRef, forwardRef, HostBinding, ChangeDetectorRef, Input, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

export declare type VideoRecordingState = 'initial' | 'recording' | 'recorded' | 'playing';

@Component({
    selector: 'edu-video-recording',
    templateUrl: './video-recording.component.html',
    styleUrls: ['./video-recording.component.scss'],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VideoRecordingComponent), multi: true}
    ]
})
export class VideoRecordingComponent implements OnInit, OnDestroy, ControlValueAccessor {

    @Input()
    public disabled: boolean;

    @ViewChild('video')
    public video: ElementRef;

    public requesting: boolean;
    public recording: boolean;

    public state: VideoRecordingState = 'initial';

    private stream: MediaStream;
    private recorder: any;

    private chunks: Blob[];
    private objectURL: string;

    constructor(private cdRef: ChangeDetectorRef) {
    }

    onChangeFn: Function = () => {
    };

    onTouchFn: Function = () => {
    };

    ngOnInit() {
        (<HTMLVideoElement>this.video.nativeElement).addEventListener('ended', this.stopPlaying.bind(this), false);
    }

    ngOnDestroy() {
        (<HTMLVideoElement>this.video.nativeElement).removeEventListener('ended', this.stopPlaying.bind(this), false);
    }

    private onGetMediaSuccess(stream: MediaStream): void {
        this.state = 'recording';
        this.recording = true;
        this.requesting = false;
        this.stream = stream;

        this.chunks = [];

        const nativeElement = (<HTMLVideoElement>this.video.nativeElement);
        nativeElement.autoplay = true;
        nativeElement.srcObject = stream;
        nativeElement.volume = 0;

        this.recorder = new MediaRecorder(stream);

        this.recorder.ondataavailable = e => {
            this.chunks.push(e.data)
        };
        

        this.recorder.onstop = e => {
            nativeElement.srcObject = null;
            nativeElement.src = '';

            const blob = new Blob(this.chunks, {type: 'video/webm'});
            this.objectURL = URL.createObjectURL(blob);

            this.onChangeFn(blob);
        };

        this.recorder.start();

        this.cdRef.detectChanges();
    }

    public startRecord(): void {
        this.requesting = true;

        this.onTouchFn();
        this.onChangeFn(undefined);

        const fallback = () => {
            alert('Couldn\'t initialize video recorder.');
            this.requesting = false;
        };

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            fallback();
            return;
        }

        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((stream: MediaStream) => this.onGetMediaSuccess(stream))
            .catch((err) => fallback());
    }

    public stopRecord(): void {
        this.state = 'recorded';

        this.recorder.stop();
        this.stream.getTracks().forEach(t => t.stop());
    }

    public play(): void {
        const nativeElement = (<HTMLVideoElement>this.video.nativeElement);
        nativeElement.autoplay = false;
        nativeElement.src = this.objectURL;
        nativeElement.volume = 1;

        nativeElement.play().then(() => {
            this.state = 'playing';
        });

        this.cdRef.detectChanges();
    }

    public stopPlaying(): void {
        (<HTMLVideoElement>this.video.nativeElement).pause();

        this.state = 'recorded';
        this.cdRef.detectChanges();
    }

    @HostBinding('class.recording')
    get isRecording(): boolean {
        return this.state === 'recording';
    }

    writeValue(data: Blob): void {
    }

    registerOnChange(fn: any): void {
        this.onChangeFn = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchFn = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
