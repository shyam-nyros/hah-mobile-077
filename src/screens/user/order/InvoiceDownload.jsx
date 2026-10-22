import React, {useState, useEffect} from 'react';
import {Alert, TouchableOpacity, Text, View} from 'react-native';
import tw from 'twrnc';
import {useDownloadOrderInvoiceLinkQuery} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';
import showToast from '../../../utils/toast/showToast';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

const InvoiceDownload = ({orderId}) => {
  const [fetchInvoice, setFetchInvoice] = useState(false);
  const {data, isLoading, isFetching, isError, error} =
    useDownloadOrderInvoiceLinkQuery(orderId, {
      skip: !fetchInvoice,
      refetchOnMountOrArgChange: true,
    });

  const handleDownloadClick = () => {
    setFetchInvoice(true);
  };


  useEffect(() => {
    const savePDF = async blob => {
      try {
        const fileName = `invoice_${orderId}.pdf`;
        var filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        if (Platform.OS == 'ios') {
          filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        }
        // Convert blob to base64
        const base64Data = await blobToBase64(blob);
        await RNFS.writeFile(filePath, base64Data, 'base64');
        if (Platform.OS == 'ios') {
          await FileViewer.open(filePath);
        }
        showToast('success', 'File downloaded successfully!');
      } catch (err) {
        console.error(err);
        showToast('error', 'Failed to download the file');
      } finally {
        setFetchInvoice(false);
      }
    };

    const blobToBase64 = blob => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    if (data && !isLoading && !isError) {
      savePDF(data);
    }

    if (isError) {
      console.error(error);
      showToast('error', 'Failed to download file.');
      setFetchInvoice(false);
    }
  }, [data, isLoading, isError, orderId]);

  return (
    <TouchableOpacity
      onPress={handleDownloadClick}
      style={tw`px-3 py-[10px] mt-5 w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
      {(isLoading || isFetching) && <LoadingSpinner size="small" />}
      <View style={tw`flex-row items-center justify-between`}>
        <View>
          <Text style={tw`text-[15px] text-[#040641]`}>Download Invoice</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default InvoiceDownload;
