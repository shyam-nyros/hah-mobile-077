import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

const VideoDetailsScreen = ({ videoUrl = "https://www.heavenathand.org:3002/uploads/posts/1731480706605-72712-544133713_tiny.mp4" }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Check and request permissions for Android
  const checkAndRequestAndroidPermissions = async () => {
    try {
      if (Platform.OS !== 'android') return true;
      
      // For Android 10 (API level 29) and below
      if (Platform.Version < 30) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to download videos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionDenied(true);
          Alert.alert(
            'Permission Required',
            'Storage permission is required to download videos. Please enable it in app settings.',
            [
              { text: 'OK', onPress: () => console.log('OK Pressed') }
            ]
          );
          return false;
        }
        return true;
      } else {
        // For Android 11 (API level 30) and above, we need different permissions
        // But for downloads to Download folder, we don't need runtime permissions
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // iOS doesn't need permissions for DocumentDirectory
  // but we'll handle everything in one function for clarity
  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      return await checkAndRequestAndroidPermissions();
    }
    return true; // iOS doesn't need permissions for DocumentDirectory
  };

  const handleDownload = async () => {
    // Reset states
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);
    setPermissionDenied(false);

    // Check if video URL is valid
    if (!videoUrl || !videoUrl.startsWith('http')) {
      Alert.alert('Error', 'Invalid video URL');
      setIsDownloading(false);
      return;
    }
    
    try {
      // Check permissions first
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        setIsDownloading(false);
        return;
      }

      // Generate file name from URL or use default
      const fileName = videoUrl.substring(videoUrl.lastIndexOf('/') + 1) || 'video.mp4';
      // Ensure file has .mp4 extension and handle URL encoding
      const decodedFileName = decodeURIComponent(fileName);
      const finalFileName = decodedFileName.includes('.') ? decodedFileName : `${decodedFileName}.mp4`;
      
      // Set destination path based on platform
      let downloadPath;
      if (Platform.OS === 'ios') {
        downloadPath = `${RNFS.DocumentDirectoryPath}/${finalFileName}`;
      } else {
        downloadPath = `${RNFS.DownloadDirectoryPath}/${finalFileName}`;
      }
      
      // Check if file already exists
      const fileExists = await RNFS.exists(downloadPath);
      if (fileExists) {
        // Ask if user wants to download again or open existing file
        Alert.alert(
          'File Already Exists',
          'This video has already been downloaded. Do you want to download it again or open the existing file?',
          [
            {
              text: 'Open Existing',
              onPress: async () => {
                try {
                  await FileViewer.open(downloadPath, { showOpenWithDialog: true });
                  setIsDownloading(false);
                } catch (err) {
                  console.error('Error opening file:', err);
                  Alert.alert('Error', 'Could not open the existing file.');
                  setIsDownloading(false);
                }
              },
            },
            {
              text: 'Download Again',
              onPress: async () => {
                // Delete existing file
                await RNFS.unlink(downloadPath);
                // Continue with download
                downloadFile(downloadPath);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsDownloading(false),
            },
          ]
        );
      } else {
        // No existing file, proceed with download
        downloadFile(downloadPath);
      }
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('Error', `Failed to set up download: ${error.message}`);
      setIsDownloading(false);
    }
  };

  const downloadFile = async (downloadPath) => {
    try {
      console.log(`Downloading from ${videoUrl} to ${downloadPath}`);
      
      // Configure download options
      const options = {
        fromUrl: videoUrl,
        toFile: downloadPath,
        background: true,
        discretionary: true,
        progress: (res) => {
          const progress = res.bytesWritten / res.contentLength;
          setDownloadProgress(progress);
        },
      };
      
      // Execute download
      const downloadResult = await RNFS.downloadFile(options).promise;
      
      if (downloadResult.statusCode === 200) {
        setDownloadComplete(true);
        
        // Open the file after download
        try {
          await FileViewer.open(downloadPath, { showOpenWithDialog: true });
          Alert.alert('Success', 'Video downloaded successfully!');
        } catch (openError) {
          console.error('Error opening file:', openError);
          Alert.alert(
            'Download Complete',
            'Video downloaded successfully, but could not be opened automatically.'
          );
        }
      } else {
        Alert.alert('Download Failed', `Error code: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity 
        onPress={handleDownload} 
        disabled={isDownloading}
        style={{
          backgroundColor: isDownloading ? '#ccc' : permissionDenied ? '#ff6b6b' : '#0077B6',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 8,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isDownloading ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 10 }} />
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
              Downloading... {Math.round(downloadProgress * 100)}%
            </Text>
          </>
        ) : permissionDenied ? (
          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
            Storage Permission Required
          </Text>
        ) : (
          <>
            <Image 
              source={require('../../assets/images/downloadwhiteicon.png')}
              style={{ width: 20, height: 20, marginRight: 10 }}
            />
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
              {downloadComplete ? 'Download Again' : 'Download Video'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default VideoDetailsScreen;