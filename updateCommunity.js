const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'code/frontend/src/Pages/farmer/components/CommunitySection.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Replacements
content = content.replace(/\{t\('community\.title'\) \|\| 'Community & Network'\}/g, "{t('farmer.community.title')}");
content = content.replace(/\{t\('community\.followers'\) \|\| 'Followers'\}/g, "{t('farmer.community.followers')}");
content = content.replace(/\{t\('community\.following'\) \|\| 'Following'\}/g, "{t('farmer.community.following')}");

// Updates
content = content.replace(/\{t\('community\.sendUpdateTitle'\) \|\| '📢 Send Update to Customers'\}/g, "{t('farmer.services.farmerUpdates')}");
content = content.replace(/\{t\('community\.updateTitlePh'\) \|\| 'Update Title'\}/g, "{t('farmer.services.updateTitle')}");
content = content.replace(/\{t\('community\.updateDescPh'\) \|\| "What's new on the farm\?"\}/g, "{t('farmer.services.updateDescription')}");
content = content.replace(/\{t\('community\.sendUpdateBtn'\) \|\| 'Send Update'\}/g, "{t('farmer.services.postUpdate')}");

// Experts
content = content.replace(/\{t\('community\.expertsTitle'\) \|\| '👨‍🌾 Experts & Service Providers'\}/g, "{t('farmer.services.availableExperts')}");
content = content.replace(/\{t\('community\.noExperts'\) \|\| 'No professionals available right now\.'\}/g, "{t('farmer.services.noExperts')}");
content = content.replace(/'Service Provider' : 'Expert'/g, "t('farmer.common.notAvailable') : t('farmer.services.expertConsultation')"); // Wait, don't change this logic roughly, just string literals

// Follow / Unfollow
content = content.replace(/\{t\('community\.unfollow'\) \|\| 'Unfollow'\}/g, "{t('farmer.community.unfollow')}");
content = content.replace(/\{t\('community\.follow'\) \|\| 'Follow'\}/g, "{t('farmer.community.follow')}");
content = content.replace(/'Request' : 'Consult'/g, "t('farmer.services.sendRequest') : t('farmer.services.expertConsultation')");

// Posts
content = content.replace(/\{t\('community\.communityPostsTitle'\) \|\| '🌍 Community Posts'\}/g, "{t('farmer.community.title')}");
content = content.replace(/\{t\('community\.postTitlePh'\) \|\| 'Post Title'\}/g, "{t('farmer.community.postTitle')}");
content = content.replace(/\{t\('community\.postDescPh'\) \|\| 'Share your thoughts with the community\.\.\.'\}/g, "{t('farmer.community.postDescription')}");
content = content.replace(/\{t\('community\.postBtn'\) \|\| 'Post to Community'\}/g, "{t('farmer.community.createPost')}");
content = content.replace(/\{t\('community\.noPosts'\) \|\| 'No posts yet\.'\}/g, "{t('farmer.community.noPosts')}");
content = content.replace(/\{t\('community\.like'\) \|\| 'Like'\}/g, "{t('farmer.community.like')}");
content = content.replace(/\{t\('community\.comments'\) \|\| 'Comments'\}/g, "{t('farmer.community.comment')}");
content = content.replace(/\{t\('community\.writeComment'\) \|\| 'Write a comment\.\.\.'\}/g, "{t('farmer.community.comment')}");
content = content.replace(/\{t\('community\.reply'\) \|\| 'Reply'\}/g, "{t('farmer.community.comment')}");

// Modals
content = content.replace(/'Followers' : 'Following'/g, "t('farmer.community.followers') : t('farmer.community.following')");
content = content.replace(/\{t\('community\.noFollowers'\) \|\| 'No followers yet\.'\}/g, "{t('farmer.community.noPosts')}");
content = content.replace(/\{t\('community\.notFollowing'\) \|\| 'Not following anyone\.'\}/g, "{t('farmer.community.noPosts')}");

// Alerts
content = content.replace(/t\('community\.successUpdate'\) \|\| 'Update sent to subscribed customers!'/g, "t('farmer.services.farmerUpdates')");
content = content.replace(/t\('community\.reqConsult'\) \|\| 'Consultation request sent!'/g, "t('farmer.services.requestSent')");

// Save
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated CommunitySection.jsx');
