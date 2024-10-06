import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LandingContacts = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
      <Card data-aos="fade-up">
        <CardHeader>
          <CardTitle>{`Have questions? We're here to help!`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Contact Information
              </h3>
              <p className="flex items-center  mb-2">
                <Mail className="h-5 w-5 mr-2" /> support@planzen.com
              </p>
              <p className="flex items-center  mb-2">
                <Phone className="h-5 w-5 mr-2" /> +1 (555) 123-4567
              </p>
              <p className="flex items-center ">
                <MapPin className="h-5 w-5 mr-2" /> 123 Productivity Lane,
                Focusville, CA 94000
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Send us a message</h3>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mb-2"
              />
              <Input type="text" placeholder="Subject" className="mb-2" />
              <textarea
                placeholder="Your message"
                className="w-full p-2 rounded-md border border-teal-950 mb-2"
                rows={4}
              ></textarea>
              <Button className="w-full">Send Message</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default LandingContacts;
