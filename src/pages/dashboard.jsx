import React from 'react'
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getSchedule } from "../lib/schedule";
import Checkbox from '../components/Checkbox';

const dashboard = () => {
  return (
    <div className="max-w-xl p-6">
      <div> 
        <h1 className="text-xl font-bold mb-2">Dashboard</h1>

        <Checkbox />
      </div>
      
      <div>

      </div>
    </div>
  )
}

export default dashboard;