import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import React from 'react';
import tw from 'twrnc';
import {useDispatch, useSelector} from 'react-redux';

import {ScrollView} from 'react-native-gesture-handler';

const questions = [
  'What information do we collect?',
  'How do we use your information?',
  'Will your information be shared with anyone?',
  'Who will your information be shared with?',
  'Do we use cookies and other tracking technologies?',
  'Do we use Google Maps?',
  'How do we handle your social logins?',
  'What is our stance on third-party websites?',
  'How long do we keep your information?',
  'What are your privacy rights?',
  'Controls for Do-Not-Track features',
  'Do California residents have specific privacy rights?',
  'Do we make updates to this policy?',
  'Do we comply with Google’s Family Policy requirements?',
  'How can you contact us about this policy?',
];

const PrivacyPolicy = ({navigation}) => {
  const dispatch = useDispatch();

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  return (
    <>
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <View style={tw`flex-row items-center justify-between p-4`}>
          <TouchableOpacity onPress={navigateToPreviousScreen}>
            <Image
              source={require('../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px] `}
            />
          </TouchableOpacity>

          <Text style={tw`text-lg font-bold text-white flex-1 text-center`}>
            {'Privacy Policy'}
          </Text>

          <View style={tw`w-10`} />
        </View>
      </SafeAreaView>
      <SafeAreaView>
        <ScrollView style={tw`m-4 mb-25 text-[#303030]`}>
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              Last updated: June 01, 2019
            </Text>
          </View>

          <Text style={tw`text-black mt-2`}>
            Thank you for choosing to be part of our community at{' '}
            <Text style={tw`text-lg font-bold text-black`}>
              Heaven At Hand, Inc.
            </Text>
            (“Company,” “we,” “us,” or “our”). We are committed to protecting
            your personal information and your right to privacy. If you have any
            questions or concerns about our policy or our practices regarding
            your personal information, please contact us at .
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:support@heavenathand.org')}>
            <Text style={tw`text-[13px] text-blue-500 underline`}>
              support@heavenathand.org
            </Text>
          </TouchableOpacity>

          <Text style={tw`text-black mt-2`}>
            When you visit our mobile application and use our services, you
            trust us with your personal information. We take your privacy very
            seriously. In this privacy policy, we explain what information we
            collect, how we use it, and what rights you have in relation to it.
            Please read this policy carefully. If you do not agree with any
            terms, please discontinue the use of our apps and services.
          </Text>

          <Text style={tw`text-black mt-2`}>
            This privacy policy applies to all information collected through our
            mobile application (“Apps”) and/or any related services, sales,
            marketing, or events (collectively referred to as the “Services”).
          </Text>

          <Text style={tw`text-black mt-2 mb-2`}>
            Please read this privacy policy carefully as it will help you make
            informed decisions about sharing your personal information with us.
          </Text>

          <Text style={{fontSize: 16, fontWeight: 600, color: 'black'}}>
            Table of Contents
          </Text>
          {questions.map((question, index) => (
            <View key={index} style={tw`flex-row items-start mb-2`}>
              <Text style={tw`text-lg font-bold text-black mr-2`}>
                {index + 1}.
              </Text>
              <Text style={tw`text-lg font-bold text-black flex-1`}>
                {question}
              </Text>
            </View>
          ))}

          <Text style={tw`text-black mt-2`}>
            For further details on any of the sections above, please reach out
            to us at
            <Text style={tw`text-[13px] text-blue-500 underline`}>
              support@heavenathand.org
            </Text>
            .
          </Text>
          {/*1 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              1. WHAT INFORMATION DO WE COLLECT?
            </Text>
            <Text style={tw`text-black mt-2`}>
              Personal Information you disclose to us In Short: We collect
              Personal Information that you provide to us, such as name,
              address, contact information, passwords, and security data,
              payment information, and social media login data. We collect
              Personal Information that you voluntarily provide to us when
              registering at the Apps, expressing an interest in obtaining
              information about us or our products and services, when
              participating in activities on the Apps (such as posting messages
              in our online forums or entering competitions, contests or
              giveaways) or otherwise contacting us. The Personal Information
              that we collect depends on the context of your interactions with
              us and the Apps, the choices you make, and the products and
              features you use. The Personal Information we collect can include
              the following: Name and Contact Data. We collect your first and
              last name, email address, postal address, phone number, and other
              similar contact data. Credentials. We collect passwords, password
              hints, and similar security information used for authentication
              and account access. Social Media Login Data. We provide you with
              the option to register using social media account details, like
              your Facebook, Twitter or other social media account. If you
              choose to register in this way, we will collect the Information
              described in the section called “HOW DO WE HANDLE YOUR SOCIAL
              LOGINS ” below. All personal Information that you provide to us
              must be true, complete, and accurate, and you must notify us of
              any changes to such personal Information. Information
              automatically collected In Short: Some information – such as IP
              address and/or browser and device characteristics – is collected
              automatically when you visit our Apps. We automatically collect
              certain Information when you visit, use or navigate the Apps. This
              Information does not reveal your specific identity (like your name
              or contact Information) but may include device and usage
              information, such as your IP address, browser and device
              characteristics, operating system, language preferences, referring
              URLs, device name, country, location, Information about how and
              when you use our Apps and other technical Information. This
              Information is primarily needed to maintain the security and
              operation of our Apps, and for our internal analytics and
              reporting purposes. Like many businesses, we also collect
              Information through cookies and similar technologies. Information
              collected through our Apps In Short: We may collect Information
              regarding your geo-location, mobile device, push notifications
              when you use our apps. If you use our Apps, we may also collect
              the following Information: Geo-Location Information. We may
              request access or permission to and track location-based
              Information from your mobile device, either continuously or while
              you are using our mobile application, to provide location-based
              services. If you wish to change our access or permissions, you may
              do so in your device’s settings. Mobile Device Access. We may
              request access or permission to certain features from your mobile
              device, including your mobile device’s camera, contacts,
              microphone, reminders, SMS messages, social media accounts,
              storage, and other features. If you wish to change our access or
              permissions, you may do so in your device’s settings. Mobile
              Device Data. We may automatically collect device information (such
              as your mobile device ID, model, and manufacturer), operating
              system, version information, and IP address. Push Notifications.
              We may request to send you push notifications regarding your
              account or the mobile application. If you wish to opt-out from
              receiving these types of communications, you may turn them off in
              your device’s settings
            </Text>
          </View>
          {/* 2 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              2. HOW DO WE USE YOUR INFORMATION
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: We process your Information for purposes based on
              legitimate business interests, the fulfillment of our contract
              with you, compliance with our legal obligations, and/or your
              consent. We use personal Information collected via our Apps for a
              variety of business purposes described below. We process your
              personal Information for these purposes in reliance on our
              legitimate business interests, in order to enter into or perform a
              contract with you, with your consent, and/or for compliance with
              our legal obligations. We indicate the specific processing grounds
              we rely on next to each purpose listed below. We use the
              Information we collect or receive: To facilitate account creation
              and logon process. If you choose to link your account with us to a
              third party account *(such as your Google or Facebook account), we
              use the Information you allowed us to collect from those third
              parties to facilitate account creation and logon process for the
              performance of the contract. See the section below headed ” HOW DO
              WE HANDLE YOUR SOCIAL LOGINS ” for further Information. To send
              you marketing and promotional communications. We and/or our
              third-party marketing partners may use the personal Information
              you send to us for our marketing purposes if this is in accordance
              with your marketing preferences. You can opt-out of our marketing
              emails at any time (see the ” WHAT ARE YOUR PRIVACY RIGHTS ”
              below). To send administrative Information to you. We may use your
              personal Information to send you the product, service, and new
              feature information and/or Information about changes to our terms,
              conditions, and policies. Fulfill and manage your orders. We may
              use your Information to fulfill and manage your orders, payments,
              returns, and exchanges made through the Apps. To post
              testimonials. We post testimonials on our Apps that may contain
              personal Information. Prior to posting a testimonial, we will
              obtain your consent to use your name and testimonial. If you wish
              to update or delete your testimonial, please contact us at
              support@heavenathand.org and be sure to include your name,
              testimonial location, and contact information. Deliver targeted
              advertising to you. We may use your Information to develop and
              display content and advertising (and work with third parties who
              do so) tailored to your interests and/or location and to measure
              its effectiveness. Administer prize draws and competitions. We may
              use your Information to administer prize draws and competitions
              when you elect to participate in competitions. Request Feedback.
              We may use your Information to request feedback and to contact you
              about your use of our Apps. To protect our Services. We may use
              your Information as part of our efforts to keep our Apps safe and
              secure (for example, for fraud monitoring and prevention). To
              enable user-to-user communications. We may use your Information in
              order to enable user-to-user communications with each user’s
              consent. To enforce our terms, conditions, and policies for
              Business Purposes, Legal Reasons, and Contractual. To respond to
              legal requests and prevent harm. If we receive a subpoena or other
              legal request, we may need to inspect the data we hold to
              determine how to respond. For other Business Purposes. We may use
              your Information for other Business Purposes, such as data
              analysis, identifying usage trends, determining the effectiveness
              of our promotional campaigns and to evaluate and improve our Apps,
              products, marketing, and your experience. We may use and store
              this Information in aggregated and anonymized form so that it is
              not associated with individual end- users and does not include
              personal Information. We will not use identifiable personal
              Information without your consent.
            </Text>
          </View>
          {/* 3 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: We only share Information with your consent, to comply
              with laws, to provide you with services, to protect your rights,
              or to fulfill business obligations. We may process or share data
              based on the following legal basis: Consent: We may process your
              data if you have given us specific consent to use your personal
              Information for a specific purpose. Legitimate Interests: We may
              process your data when it is reasonably necessary to achieve our
              legitimate business interests. Performance of a Contract: Where we
              have entered into a contract with you, we may process your
              personal Information to fulfill the terms of our contract. Legal
              Obligations: We may disclose your Information where we are legally
              required to do so in order to comply with applicable law,
              governmental requests, a judicial proceeding, court order, or
              legal process, such as in response to a court order or a subpoena
              (including in response to public authorities to meet national
              security or law enforcement requirements). Vital Interests: We may
              disclose your Information where we believe it is necessary to
              investigate, prevent, or take action regarding potential
              violations of our policies, suspected fraud, situations involving
              potential threats to the safety of any person and illegal
              activities, or as evidence in litigation in which we are involved.
              More specifically, we may need to process your data or share your
              personal Information in the following situations: Vendors,
              Consultants, and Other Third-Party Service Providers. We may share
              your data with third-party vendors, service providers,
              contractors, or agents who perform services for us or on our
              behalf and require access to such Information to do that work.
              Examples include payment processing, data analysis, email
              delivery, hosting services, customer service, and marketing
              efforts. We may allow selected third parties to use tracking
              technology on the Apps, which will enable them to collect data
              about how you interact with the Apps over time. This Information
              may be used to, among other things, analyze and track data,
              determine the popularity of certain content, and better understand
              online activity. Unless described in this Policy, we do not share,
              sell, rent, or trade any of your Information with third parties
              for their promotional purposes. Business Transfers. We may share
              or transfer your Information in connection with, or during
              negotiations of, any merger, sale of company assets, financing, or
              acquisition of all or a portion of our business to another
              company. Third-Party Advertisers. We may use third-party
              advertising companies to serve ads when you visit the Apps. These
              companies may use Information about your visits to our Website(s)
              and other websites that are contained in web cookies and other
              tracking technologies in order to provide advertisements about
              goods and services of interest to you. Affiliates. We may share
              your Information with our affiliates, in which case we will
              require those affiliates to honor this privacy policy. Affiliates
              include our parent company and any subsidiaries, joint venture
              partners or other companies that we control or that are under
              common control with us. Business Partners. We may share your
              Information with our business partners to offer you certain
              products, services, or promotions. Other Users. When you share
              personal Information (for example, by posting comments,
              contributions, or other content to the Apps) or otherwise interact
              with public areas of the Apps, such personal Information may be
              viewed by all users and may be publicly distributed outside the
              Apps in perpetuity. If you interact with other users of our Apps
              and register through a social network (such as Facebook), your
              contacts on the social network will see your name, profile photo,
              and descriptions of your activity. Similarly, other users will be
              able to view descriptions of your activity, communicate with you
              within our Apps, and view your profile. Offer Wall. Our Apps may
              display a third-party hosted “offer wall.” Such an offer wall
              allows third-party advertisers to offer virtual currency, gifts,
              or other items to users in return for acceptance and completion of
              an advertisement offer. Such an offer wall may appear in our
              mobile application and be displayed to you based on certain data,
              such as your geographic area or demographic Information. When you
              click on an offer wall, you will leave our mobile application. A
              unique identifier, such as your user ID, will be shared with the
              offer wall provider in order to prevent fraud and properly credit
              your account.
            </Text>
          </View>
          {/* 4 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              4. WHO WILL YOUR INFORMATION BE SHARED WITH
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: We only share Information with the following third
              parties. We only share and disclose your Information with the
              following third parties. We have categorized each party so that
              you may easily understand the purpose of our data collection and
              processing practices. If we have processed your data based on your
              consent and you wish to revoke your consent, please contact us.
            </Text>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              Advertising, Direct Marketing, and Lead Generation
            </Text>
            <Text style={tw`text-black `}>None at this time.</Text>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              Allow Users to Connect to their Third-Party Accounts
            </Text>
            <Text style={tw`text-black `}>
              Facebook account, Instagram account, LinkedIn account, and Twitter
              account
            </Text>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              Content Optimization{' '}
            </Text>
            <Text style={tw`text-black `}>None at this time.</Text>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              Invoice and Billing{' '}
            </Text>
            <Text style={tw`text-black `}> PayPal </Text>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              Web and Mobile Analytics{' '}
            </Text>
            <Text style={tw`text-black `}> Google Analytics </Text>
            <Text style={tw`text-black`}> Website Hosting </Text>
            <Text style={tw`text-black`}> WordPress.com </Text>
          </View>
          {/* 5 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: We may use cookies and other tracking technologies to
              collect and store your Information. We may use cookies and similar
              tracking technologies (like web beacons and pixels) to access or
              store Information. Specific Information about how we use such
              technologies and how you can refuse certain cookies is set out in
              our Cookie Policy.
            </Text>
          </View>
          {/* 6 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              6. DO WE USE GOOGLE MAPS?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: Yes, we use Google Maps for the purpose of providing
              better service. This website, mobile application, or Facebook
              application uses Google Maps APIs. You may find the Google Maps
              APIs Terms of Service here. To better understand Google’s Privacy
              Policy, please refer to this link. By using our Maps API
              Implementation, you agree to be bound by Google’s Terms of
              Service. You agree to allow us to obtain or cache your location.
              You may revoke your consent at any time. We use Information about
              location in conjunction with data from other data providers.
            </Text>
          </View>
          {/* 7 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: If you choose to register or log in to our services
              using a social media account, we may have access to certain
              Information about you. Our Apps offer you the ability to register
              and login using your third party social media account details
              (like your Facebook or Twitter logins). Where you choose to do
              this, we will receive certain profile information about you from
              your social media provider. The profile Information we receive may
              vary depending on the social media provider concerned, but will
              often include your name, email address, friends list, profile
              picture as well as other Information you choose to make public. We
              will use the Information we receive only for the purposes that are
              described in this privacy policy or that are otherwise made clear
              to you on the Apps. Please note that we do not control and are not
              responsible for other uses of your personal Information by your
              third party social media provider. We recommend that you review
              their privacy policy to understand how they collect, use, and
              share your personal Information, and how you can set your privacy
              preferences on their sites and apps.
            </Text>
          </View>
          {/* 8 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              8. WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: We are not responsible for the safety of any information
              that you share with third-party providers who advertise, but are
              not affiliated with, our websites. The Apps may contain
              advertisements from third parties that are not affiliated with us
              and which may link to other websites, online services, or mobile
              applications. We cannot guarantee the safety and privacy of data
              you provide to any third parties. Any data collected by third
              parties is not covered by this privacy policy. We are not
              responsible for the content or privacy and security practices and
              policies of any third parties, including other websites, services,
              or applications that may be linked to or from the Apps. You should
              review the policies of such third parties and contact them
              directly to respond to your questions.
            </Text>
          </View>
          {/* 9 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              9. HOW LONG DO WE KEEP YOUR INFORMATION?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: We keep your Information for as long as necessary to
              fulfill the purposes outlined in this privacy policy unless
              otherwise required by law. We will only keep your personal
              Information for as long as it is necessary for the purposes set
              out in this privacy policy unless a longer retention period is
              required or permitted by law (such as tax, accounting, or other
              legal requirements). No purpose in this Policy will require us
              keeping your personal Information for longer than 2 years past the
              termination of the user’s account. When we have no ongoing
              legitimate business need to process your personal Information, we
              will either delete or anonymize it, or, if this is not possible
              (for example, because your personal Information has been stored in
              backup archives), then we will securely store your personal
              Information and isolate it from any further processing until
              deletion is possible.
            </Text>
          </View>
          {/* 10 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              10. WHAT ARE YOUR PRIVACY RIGHTS?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: You may review, change, or terminate your account at any
              time. If you are resident in the European Economic Area and you
              believe we are unlawfully processing your personal Information,
              you also have the right to complain to your local data protection
              supervisory authority. You can find their contact details here:
              http://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm
            </Text>
            <Text style={tw`text-black mt-2`}>Account Information</Text>
            <Text style={tw`text-black mt-2`}>
              If you would at any time like to review or change the Information
              in your account or terminate your account, you can:
            </Text>
            <View style={tw`flex-row items-start mt-2`}>
              <Text style={tw`text-base text-black mr-2`}>•</Text>
              <Text style={tw`text-base text-gray-700 flex-1`}>
                Log in to your account settings and update your user account.
              </Text>
            </View>
            <View style={tw`flex-row items-start mt-2`}>
              <Text style={tw`text-base text-black mr-2`}>•</Text>
              <Text style={tw`text-base text-gray-700 flex-1`}>
                Contact us using the contact information provided.
              </Text>
            </View>
            <Text style={tw`text-black mt-2`}>
              Upon your request to terminate your account, we will deactivate or
              delete your account and Information from our active databases.
              However, some information may be retained in our files to prevent
              fraud, troubleshoot problems, assist with any investigations,
              enforce our Terms of Use, and/or comply with legal requirements.
              Cookies and similar technologies: Most Web browsers are set to
              accept cookies by default. If you prefer, you can usually choose
              to set your browser to remove cookies and to reject cookies. If
              you choose to remove cookies or reject cookies, this could affect
              certain features or services of our Apps. To opt-out of
              interest-based advertising by advertisers on our Apps, visit
              http://www.aboutads.info/choices/.
            </Text>
            <Text style={tw`text-black mt-2`}>
              Opting out of email marketing: You can unsubscribe from our
              marketing email list at any time by clicking on the unsubscribe
              link in the emails that we send or by contacting us using the
              details provided below. You will then be removed from the
              marketing email list – however, we will still need to send you
              service-related emails that are necessary for the administration
              and use of your account. To otherwise opt- out, you may
            </Text>
            <View style={tw`flex-row items-start mt-2`}>
              <Text style={tw`text-base text-black mr-2`}>•</Text>
              <Text style={tw`text-base text-gray-700 flex-1`}>
                Access your account settings and update preferences.
              </Text>
            </View>
            {/* List Item 2 */}
            <View style={tw`flex-row items-start mt-2`}>
              <Text style={tw`text-base text-black mr-2`}>•</Text>
              <Text style={tw`text-base text-gray-700 flex-1`}>
                Contact us using the contact information provided.
              </Text>
            </View>
          </View>
          {/* 11 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              11. CONTROLS FOR DO-NOT-TRACK FEATURES
            </Text>
            <Text style={tw`text-black mt-2`}>
              Most web browsers and some mobile operating systems and mobile
              applications include a Do-Not-Track (“DNT”) feature or setting you
              can activate to signal your privacy preference not to have data
              about your online browsing activities monitored and collected. No
              uniform technology standard for recognizing and implementing DNT
              signals has been finalized. As such, we do not currently respond
              to DNT browser signals or any other mechanism that automatically
              communicates your choice not to be tracked online. If a standard
              for online tracking is adopted that we must follow in the future,
              we will inform you about that practice in a revised version of
              this privacy policy.
            </Text>
          </View>
          {/* 12 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              12. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: Yes, if you are a resident of California, you are
              granted specific rights regarding access to your personal
              Information. California Civil Code Section 1798.83, also known as
              the “Shine The Light” law, permits our users who are California
              residents to request and obtain from us, once a year and free of
              charge, Information about categories of personal Information (if
              any) we disclosed to third parties for direct marketing purposes
              and the names and addresses of all third parties with which we
              shared personal Information in the immediately preceding calendar
              year. If you are a California resident and would like to make such
              a request, please submit your request in writing to us using the
              contact information provided below. If you are under 18 years of
              age, reside in California, and have a registered account with the
              Apps, you have the right to request removal of unwanted data that
              you publicly post on the Apps. To request removal of such data,
              please contact us using the contact information provided below and
              include the email address associated with your account and a
              statement that you reside in California. We will make sure the
              data is not publicly displayed on the Apps, but please be aware
              that the data may not be completely or comprehensively removed
              from our systems.
            </Text>
          </View>
          {/* 13 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              13. DO WE MAKE UPDATES TO THIS POLICY?
            </Text>
            <Text style={tw`text-black mt-2`}>
              In Short: Yes, we will update this Policy as necessary to stay
              compliant with relevant laws. We may update this privacy policy
              from time to time. The updated version will be indicated by an
              updated “Revised” date, and the updated version will be effective
              as soon as it is accessible. If we make material changes to this
              privacy policy, we may notify you either by prominently posting a
              notice of such changes or by directly sending you a notification.
              We encourage you to review this privacy policy frequently to be
              informed of how we are protecting your Information.
            </Text>
          </View>
          {/* 14 */}
          <View>
            <Text style={tw`text-lg font-bold text-black mt-2`}>
              14. HOW CAN YOU CONTACT US ABOUT THIS POLICY?
            </Text>
            <Text style={tw`text-black mt-2`}>
              If you have questions or comments about this Policy, you may email
              us at support@heavenathand..org or by post to:
            </Text>
            <Text style={tw`text-black mt-2`}>Heaven At Hand, Inc.</Text>
            <Text style={tw`text-black mt-2`}>5660 Strand Ct.</Text>
            <Text style={tw`text-black mt-2`}>Naples, FL 34110</Text>
            <Text style={tw`text-black mt-2`}>United States</Text>
            <Text style={tw`text-black mt-2`}>
              How can you review, update, or delete the data we collect from
              you?
            </Text>
            <Text style={tw`text-black mt-2`}>
              Based on the laws of some countries, you may have the right to
              request access to the personal Information we collect from you,
              change that Information, or delete it in some circumstances. To
              request to review, update, or delete your personal Information,
              please submit a request form by clicking here. We will respond to
              your request within 30 days.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default PrivacyPolicy;
