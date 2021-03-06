Noise Recorder
==============

This program is written in Python 3 and is meant to run on a Rasperry Pi with a Wolfson Pi audio card.

The way it works:
* Record a sound sample with 2048 points, at a sample rate of 44100 Hz, in 16 bit.
* The noise level from this sample frame is the standard deviation of the data.
* Passing the sample through pythons `numpy.fft.rfft` gives 1024 frequency amplitudes linearly distributed in the range 22 Hz to 22 kHz.
* To reduce the data, the 1024 points are limited to 8 logarithmically spaced bins where the value in each bin is the maximum amplitude
  of the frequencies in the bin's range.

The code supports taking samples from all the sound cards inputs, which are:
* Two on-chip DMICs
* One two channel line-in jack
* Microphone input from the headset jack.

## Data format

```javascript
{
        "_id" : ObjectId("547a33d074fece76507f56a7"),
        "date" : ISODate("2014-11-29T14:00:00.224Z"),
        "noise" : {
                "avg60s" : 12.369901615464896,
                "avg15s" : 12.220005281307806,
                "avg30s" : 12.33359290124818,
                "level" : 12.03829947695583
        },
        "frequency" : {
                "type" : "logbin8",
                "values" : [
                        0.6396404133986057,
                        0.7248769012781938,
                        0.5374522119591678,
                        0.590548980949502,
                        0.48946817041218266,
                        0.5631367506846224,
                        0.635258344774084,
                        0.5787105732729578
                ]
        },
        "location" : "testdata"
}
```

The `time` field of the data is in `ISODate` format, which allows searching with queries such as

`db.noise.findOne({date:{$gt:ISODate('2014-11-29T12:00:00')}})`

The `location` field is intended to indicate which microphone the data is collected from.

The `noise` field contains the level and average values of the measured "loudness". 
The units are derived from the raw data, and depends on the recording levels of the
sound card. To get a somewhat useful measure one could use the formula

`leveldB = 20 * log10(level/2^15)`

where 0 dB is the loudest possible output.

The frequency bins are:

1.     21-   31 Hz
2.     31-   46 Hz
3.     46-   68 Hz
4.     68-  100 Hz
5.    100-  147 Hz
6.    147-  217 Hz
7.    217-  318 Hz
8.    318-  468 Hz
9.    468-  689 Hz
10.    689- 1012 Hz
11.   1012- 1488 Hz
12.   1488- 2187 Hz
13.   2187- 3215 Hz
14.   3215- 4725 Hz
15.   4725- 6945 Hz
16.   6945-10207 Hz
17.  10207-15002 Hz
18.  15002-22050 Hz


where the exact limits can be computed with 
```python
sampleNum = 2048
sampleRate = 44100
numBins = 8
numpy.logspace(numpy.log10(1/sampleNum), numpy.log10(1/2),numBins+1)*sampleRate
```

The units are the same as for the noise level.



## Hardware worklog

* Downloaded and installed `2014-09-09-wheezy-raspbian.img` to the SD card.
* Updated system through `apt-get`.
* Downloaded Wolfson Pi drivers, [instructions here](http://www.element14.com/community/thread/31714/l/instructions-for-compiling-the-wolfson-audio-card-kernel-drivers-and-supported-use-cases).
* Compiled kernel with sound card support.
* Downloaded PyAlsaAudio, [documentation here](http://pyalsaaudio.sourceforge.net/), [download](http://sourceforge.net/projects/pyalsaaudio/). (Also available through `pip`.)
* There seems to be a bug in the driver for the sound card, [kernel patch available here](http://www.element14.com/community/thread/32623/l/driver-instability-issue).
* Updated numpy to version 1.9.1 with the command `sudo pip-3.2 install numpy --upgrade`, since version 1.6 did not have `np.fft.rfftfreq()`.
* Considering using low / high-pass filtering for the microphones. This removes static noise but could possibly remove some noise we actually want to record.
  [instructions here](http://www.element14.com/community/thread/32434/l/wolfson--voice-record-volume-too-low-using-dmic).
* Changed SD card due to possibly corrupted old one.
* Switched to precompiled kernel.
* Compiled kernel again, using [this guide](https://blog.georgmill.de/2014/04/29/compile-wolfson-audio-card-driver-for-kernel-3-12-y-a-new-try/) with [this kernel patch](http://www.element14.com/community/thread/32623/l/driver-instability-issue).
* Configured Raspberry Pi to autostart program on power up.


## Installation from scratch
* Setup Raspberry Pi with `2014-09-09-wheezy-raspbian.img`.
* Run the following commands
```bash
sudo raspi-config
# reboot
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install libasound2-dev python3-pip vim tmux
sudo pip-3.2 install pymongo pyalsaaudio

git clone https://github.com/dawsonbotsford/soundvisualizer
mkdir patched_kernel
tar -xvjf patched_kernel.tar.bz2 -C patched_kernel
sudo cp -r patched_kernel/* /
sudo sh -c 'echo kernel=kernel_3.12_patch.img >> /boot/config.txt'

sudo sync
sudo reboot

# add the line below to /etc/rc.local
# /bin/chmod o+w /sys/class/leds/led0/trigger /sys/class/leds/led0/brightness

git clone https://github.com/dawsonbotsford/soundvisualizer
# setup mongodb credentials in mongocred.txt
```

## Todo
* Make sure device keeps going if network / power fails.
* Application configurable sound levels.
* Application configurable low-/high-pass filter.
* Decide on whether the sound should be filtered, and what sound card settings are the best.
