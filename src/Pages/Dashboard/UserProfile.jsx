import React, { useState } from "react";
import profileImg from "../../assets/login-bg.png";
import * as Yup from "yup";

const UserProfile = () => {
  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
  
  const [profile, setProfile] = useState({
    firstName: "Zaid",
    lastName: "Rana",
    headline: "Software Engineer",
    email: "mzaidrana0@gmail.com",
    phoneNumber: "",
    location: "Karachi, PK",
    twitter: "",
    linkedin: "",
    github: "",
  });
  const [formData, setFormData] = useState({
    firstName: "Zaid",
    lastName: "Rana",
    headline: "Software Engineer",
    email: "mzaidrana0@gmail.com",
    phoneNumber: "",
    location: "Karachi, PK",
    twitter: "",
    linkedin: "",
    github: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const validationSchema = Yup.object({
    firstName: Yup.string().required("first name is required"),
    lastName: Yup.string().required("last name is required"),
    headline: Yup.string().max(80, "headline must be at most 80 characters"),
    email: Yup.string().email("invalid email format"),
    phoneNumber: Yup.string().matches(/^\d{10}$/, "phone number must be 10 digits"),
    location: Yup.string().notRequired(),
    twitter: Yup.string().url("invalid url").nullable().notRequired(),
    linkedin: Yup.string().url("invalid url").nullable().notRequired(),
    github: Yup.string().url("invalid url").nullable().notRequired(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors && errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        headline: formData.headline,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        github: formData.github,
      });
      setIsEditing(false);
      console.log("profile saved", formData);
    } catch (error) {
      const newError = {};
      if (error && error.inner) {
        error.inner.forEach((err) => {
          newError[err.path] = err.message;
        });
      }
      setErrors(newError);
    }
  };

  const handleEdit = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setErrors({});
    setIsEditing(false);
  };
  


  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="h-28 md:h-36 bg-gradient-to-r from-[#12343a] via-[#050414] to-[#12343a]"></div>
        <div className="bg-gray-50">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="-mt-16">
                  <img
                    src={profileImg}
                    alt="User avatar"
                    className="h-24 w-24 sm:h-24 sm:w-24 md:h-24 md:w-24 rounded-full ring-4 ring-white object-cover"
                  />
                </div>
                <div className="mt-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 text-gray-700 px-2 py-1 rounded-md">{profile.email}</span>
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{profile.headline}</span>
                    {/* <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">Available for work</span> */}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.9 0-1.3.47-2.36 1.24-3.19-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.22a11.5 11.5 0 0 1 6 0c2.29-1.54 3.3-1.22 3.3-1.22.66 1.66.24 2.88.12 3.18.77.83 1.24 1.9 1.24 3.19 0 4.58-2.8 5.6-5.48 5.9.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5z"/>
                    </svg>
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.82-2.2 3.75-2.2 4 0 4.73 2.6 4.73 6V24h-4v-7.1c0-1.7 0-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.8V24h-4V8z"/>
                    </svg>
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.87-2.36 8.55 8.55 0 0 1-2.71 1.04 4.26 4.26 0 0 0-7.26 3.89A12.08 12.08 0 0 1 3.15 4.6a4.26 4.26 0 0 0 1.32 5.68 4.23 4.23 0 0 1-1.93-.53v.05a4.26 4.26 0 0 0 3.42 4.17 4.28 4.28 0 0 1-1.93.07 4.26 4.26 0 0 0 3.98 2.96A8.55 8.55 0 0 1 2 19.54a12.07 12.07 0 0 0 6.54 1.92c7.85 0 12.14-6.5 12.14-12.13 0-.18 0-.36-.01-.54A8.67 8.67 0 0 0 24 5.1a8.45 8.45 0 0 1-2.54.7z"/>
                    </svg>
                  </a>
                )}
                <button onClick={handleEdit} disabled={isEditing} className="px-3 sm:px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-60 cursor-pointer">Edit Profile</button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-row-12 gap-6">
            

            <main className="lg:col-span-9">
              <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Personal information</h3>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">First name</label>
                          <input disabled={!isEditing} name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="Zaid" />
                          {errors && errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Last name</label>
                          <input disabled={!isEditing} name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Rana" />
                          {errors && errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-500">Headline</label>
                          <input disabled={!isEditing} name="headline" value={formData.headline} onChange={handleChange} className={inputClass} placeholder="Product Designer" />
                          {errors && errors.headline && <div className="text-red-500 text-xs mt-1">{errors.headline}</div>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Contact</h3>
                      <div className="mt-3 grid grid-cols-1 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">Email</label>
                          <input disabled={!isEditing} type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="zaid@example.com" />
                          {errors && errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Phone</label>
                          <input disabled={!isEditing} name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} placeholder="(+92) 300 0000000" />
                          {errors && errors.phoneNumber && <div className="text-red-500 text-xs mt-1">{errors.phoneNumber}</div>}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Location</label>
                          <input disabled={!isEditing} name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="Lahore, PK" />
                          {errors && errors.location && <div className="text-red-500 text-xs mt-1">{errors.location}</div>}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-medium text-gray-700">Social links</h3>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Twitter</label>
                        <input disabled={!isEditing} name="twitter" value={formData.twitter} onChange={handleChange} className={inputClass} placeholder="https://twitter.com/username" />
                        {errors && errors.twitter && <div className="text-red-500 text-xs mt-1">{errors.twitter}</div>}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">LinkedIn</label>
                        <input disabled={!isEditing} name="linkedin" value={formData.linkedin} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/in/username" />
                        {errors && errors.linkedin && <div className="text-red-500 text-xs mt-1">{errors.linkedin}</div>}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">GitHub</label>
                        <input disabled={!isEditing} name="github" value={formData.github} onChange={handleChange} className={inputClass} placeholder="https://github.com/username" />
                        {errors && errors.github && <div className="text-red-500 text-xs mt-1">{errors.github}</div>}
                      </div>
                    </div>
                  </section>

                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={handleCancel} disabled={!isEditing} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60 cursor-pointer">Cancel</button>
                    <button type="submit" disabled={!isEditing} className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-60 cursor-pointer">Save changes</button>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
